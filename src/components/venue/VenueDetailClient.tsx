'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  Phone,
  Check,
  BadgeCheck,
  Share2,
  Heart,
  MessageCircle,
  Navigation,
} from 'lucide-react'
import { SlotPicker } from '@/components/booking/SlotPicker'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { VenueCard } from '@/components/venue/VenueCard'
import { createClient } from '@/lib/supabase'
import { fetchSlots, fetchVenueReviews, fetchVenues } from '@/lib/supabase-queries'
import { AMENITY_LABELS, AMENITY_ICONS, SPORT_LABELS, formatTime } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import { useToastStore } from '@/store/useToastStore'
import { useAuth } from '@/hooks/useAuth'
import type { Court, Slot, Venue, Review } from '@/types'

type ReviewSort = 'recent' | 'highest' | 'lowest'

export function VenueDetailClient({ venue }: { venue: Venue }) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [reviewSort, setReviewSort] = useState<ReviewSort>('recent')
  const [reviews, setReviews] = useState<(Review & { name?: string })[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [similarVenues, setSimilarVenues] = useState<Venue[]>([])
  const [justUpdated, setJustUpdated] = useState<Set<string>>(new Set())
  const [bookingLoading, setBookingLoading] = useState(false)
  const [schedule, setSchedule] = useState<{ slots: Slot[]; court: Court | null }>({ slots: [], court: null })
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(venue.id)
  const showToast = useToastStore((s) => s.showToast)
  const { user } = useAuth()

  useEffect(() => {
    fetchVenueReviews(venue.id).then((data) =>
      setReviews(data.map((r) => ({ ...r, name: (r as unknown as Record<string, unknown>).user ? ((r as unknown as Record<string, unknown>).user as Record<string, string>).full_name : 'Anonymous' })))
    )
    fetchVenues().then((all) =>
      setSimilarVenues(
        all.filter((v) => v.id !== venue.id && (v.area?.slug === venue.area?.slug || v.sports.some((s) => venue.sports.includes(s)))).slice(0, 3)
      )
    )
  }, [venue.id, venue.area?.slug, venue.sports])

  useEffect(() => {
    if (!venue.courts?.length) return
    Promise.all(venue.courts.map((c) => fetchSlots(c.id, selectedDate))).then((results) =>
      setSlots(results.flat())
    )
  }, [venue.courts, selectedDate])

  useEffect(() => {
    if (!venue.courts?.length) return
    const supabase = createClient()
    const courtIds = venue.courts.map((c) => c.id)
    const channels = courtIds.map((courtId) =>
      supabase
        .channel(`slots-${courtId}-${selectedDate}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'slots', filter: `court_id=eq.${courtId}` },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setSlots((prev) => prev.map((s) =>
                s.id === payload.new.id
                  ? { ...s, status: payload.new.status, blocked_reason: payload.new.blocked_reason }
                  : s
              ))
              setJustUpdated((prev) => new Set(prev).add(payload.new.id))
              setTimeout(() => setJustUpdated((prev) => { const next = new Set(prev); next.delete(payload.new.id); return next }), 2000)
              if (payload.new.status === 'booked' || payload.new.status === 'blocked') {
                showToast('A slot was just updated by another user', 'info')
              }
            } else if (payload.eventType === 'INSERT' && payload.new.date === selectedDate) {
              setSlots((prev) => {
                if (prev.some((s) => s.id === payload.new.id)) return prev
                return [...prev, payload.new as Slot].sort((a, b) => a.start_time.localeCompare(b.start_time))
              })
            }
          }
        )
        .subscribe()
    )
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)) }
  }, [venue.courts, selectedDate, showToast])

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(venue.id)
    if (result === 'signed_out') router.push('/login')
  }

  const sortedReviews = useMemo(() => {
    if (reviewSort === 'highest') return [...reviews].sort((a, b) => b.rating - a.rating)
    if (reviewSort === 'lowest') return [...reviews].sort((a, b) => a.rating - b.rating)
    return [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [reviews, reviewSort])

  const handleBook = async () => {
    const selectedSlots = schedule.slots
    if (selectedSlots.length === 0) return

    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      router.push(`/login?redirect=${encodeURIComponent(`/venues/${venue.slug}#book-a-slot`)}`)
      return
    }

    setBookingLoading(true)

    try {
      const courtId = selectedSlots[0].court_id
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_ids: selectedSlots.map((s) => s.id),
          venue_id: venue.id,
          court_id: courtId,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || 'Failed to create order', 'error')
        setBookingLoading(false)
        return
      }

      const { order_id, amount, currency } = await res.json()

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: 'CricBooking',
        description: `${selectedSlots.length} slot(s) at ${venue.name}`,
        order_id,
        prefill: {
          name: user?.full_name || '',
          email: user?.email || authUser.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#2563eb' },
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              slot_ids: selectedSlots.map((s) => s.id),
              venue_id: venue.id,
              court_id: courtId,
            }),
          })

          if (verifyRes.ok) {
            const { bookings } = await verifyRes.json()
            const codes = bookings.map((b: { booking_code: string }) => b.booking_code).join(',')
            router.push(`/bookings/confirmed?codes=${codes}`)
          } else {
            showToast('Payment verified but booking failed. Contact support.', 'error')
          }
          setBookingLoading(false)
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false)
            showToast('Payment cancelled', 'info')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
      setBookingLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: venue.name, url })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!', 'info')
    }
  }

  const whatsappHref = venue.phone
    ? `https://wa.me/${venue.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to know more about ${venue.name} on CricBooking.`)}`
    : null

  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
  const heroImage = venue.cover_image ?? venue.images[0] ?? null
  const secondaryImage = venue.images.find((img) => img !== heroImage) ?? heroImage

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero */}
      <section className="relative -mt-16 pt-16 overflow-hidden">
        <div className="absolute inset-0">
          {heroImage ? (
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-700 to-surface-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/60 to-surface-900/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16 sm:pt-12 sm:pb-24">
          <Link href="/venues" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to venues
          </Link>

          <p className="text-brand-400 text-sm font-medium mt-8">{SPORT_LABELS[venue.sports[0]] ?? 'Sports'}</p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-white mt-2 max-w-2xl text-balance">
            Book {venue.name} for your next session.
          </h1>
          {venue.description && (
            <p className="text-white/70 mt-4 max-w-xl">{venue.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a href="#book-a-slot" className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 transition-colors">
              Start Booking <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={handleToggleFavorite}
              className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <Heart className={favorite ? 'w-4 h-4 fill-red-500 text-red-500' : 'w-4 h-4'} />
              {favorite ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-white/80">
            {venue.status === 'approved' && (
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-brand-400" /> Verified Venue
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              {venue.rating.toFixed(1)} ({venue.total_reviews} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {venue.area?.name ?? venue.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 lg:pb-16">
        {/* Booking */}
        <section id="book-a-slot" className="relative -mt-8 sm:-mt-12 scroll-mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
              <h2 className="font-display font-semibold text-lg text-surface-900">Choose your schedule</h2>
              <p className="text-sm text-surface-800/50 mt-1 mb-5">
                Select a date, available time, and court before booking.
              </p>
              {venue.courts && venue.courts.length > 0 ? (
                <SlotPicker
                  courts={venue.courts}
                  slots={slots}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onSelectionChange={(selectedSlots, court) => setSchedule({ slots: selectedSlots, court })}
                  justUpdated={justUpdated}
                />
              ) : (
                <p className="text-sm text-surface-800/50">No courts available for this venue.</p>
              )}
            </div>

            <BookingSummary
              court={schedule.court}
              selectedDate={selectedDate}
              selectedSlots={schedule.slots}
              areaName={venue.area?.name}
              onBook={handleBook}
              loading={bookingLoading}
            />
          </div>
        </section>

        {/* Venue details */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16 sm:mt-24">
          <div className="rounded-2xl overflow-hidden bg-surface-100 aspect-[4/3] lg:aspect-auto lg:h-full relative">
            {secondaryImage ? (
              <img src={secondaryImage} alt={venue.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-600" />
            )}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {venue.sports.slice(0, 2).map((sport) => (
                <span key={sport} className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {SPORT_LABELS[sport] ?? sport}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-brand-600 text-sm font-medium">Venue details</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-surface-900 mt-2 text-balance">
              Know the space before <span className="font-black">you book.</span>
            </h2>
            <p className="text-surface-800/60 mt-3 leading-relaxed">
              {venue.description ?? `A well-maintained venue in ${venue.area?.name ?? venue.city}, set up for casual games, private sessions, and regular weekly play.`}
            </p>

            <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
              <h3 className="font-display font-semibold text-sm text-surface-900">Best for</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {venue.sports.map((sport) => (
                  <span key={sport} className="text-xs font-medium text-surface-800 bg-surface-100 px-2.5 py-1 rounded-full">
                    {SPORT_LABELS[sport] ?? sport}
                  </span>
                ))}
              </div>
            </div>

            {venue.amenities.length > 0 && (
              <div className="bg-white rounded-xl border border-surface-200 p-5 mt-4">
                <h3 className="font-display font-semibold text-sm text-surface-900">Facilities</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-3">
                  {venue.amenities.map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity]
                    return (
                      <span key={amenity} className="flex items-center gap-2 text-sm text-surface-800">
                        <span className="w-4 h-4 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          {Icon ? <Icon className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                        </span>
                        {AMENITY_LABELS[amenity] ?? amenity}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-surface-200 p-5 mt-4">
              <h3 className="font-display font-semibold text-sm text-surface-900">Booking notes</h3>
              <ul className="flex flex-col mt-3">
                {[
                  `Book at least ${venue.min_advance_hours} hour(s) in advance.`,
                  `Bookings open up to ${venue.max_advance_days} days ahead.`,
                  `Cancel ${venue.cancellation_hours}+ hours before for a ${venue.cancellation_refund_pct}% refund.`,
                ].map((note, i) => (
                  <li key={note} className={`flex items-start gap-3 py-2.5 text-sm text-surface-800/70 ${i > 0 ? 'border-t border-surface-100' : ''}`}>
                    <span className="text-brand-600 font-semibold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            {(venue.phone || venue.address) && (
              <div className="flex flex-col gap-2 mt-4 text-sm text-surface-800">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-surface-800/50 shrink-0" />
                  {venue.address}
                  <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-xs font-medium shrink-0">
                    <Navigation className="w-3 h-3" /> Directions
                  </a>
                </span>
                {venue.phone && (
                  <div className="flex gap-2 mt-1">
                    <a href={`tel:${venue.phone}`} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-surface-200 text-sm font-medium text-surface-800 hover:bg-surface-100">
                      <Phone className="w-4 h-4" /> Call
                    </a>
                    {whatsappHref && (
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </a>
                    )}
                  </div>
                )}
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block rounded-lg overflow-hidden border border-surface-200 h-32"
                >
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(venue.address)}&z=15&output=embed`}
                    className="w-full h-full pointer-events-none"
                    loading="lazy"
                    title={`Map showing location of ${venue.name}`}
                  />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-16 sm:mt-24">
          <p className="text-brand-600 text-sm font-medium">Reviews</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-surface-900 text-balance">
              Players who booked <span className="font-black">{venue.name}.</span>
            </h2>
            {sortedReviews.length > 1 && (
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value as ReviewSort)}
                className="px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-400 shrink-0"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl border border-surface-200 p-5">
              {venue.total_reviews > 0 ? (
                <>
                  <p className="font-display font-bold text-4xl text-surface-900">
                    {venue.rating.toFixed(1)}<span className="text-lg text-surface-800/40 font-normal"> /5 rating</span>
                  </p>
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(venue.rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-surface-800/50 mt-2">Based on {venue.total_reviews} player review{venue.total_reviews === 1 ? '' : 's'}.</p>
                </>
              ) : (
                <>
                  <p className="font-display font-semibold text-surface-900">No reviews yet</p>
                  <p className="text-sm text-surface-800/50 mt-2">Be the first to play here and leave a review.</p>
                </>
              )}
            </div>

            {sortedReviews.slice(0, 2).map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-surface-200 p-5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-surface-800/80 mt-3 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                <div className="flex items-center gap-2.5 mt-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-display font-semibold text-xs flex items-center justify-center shrink-0">
                    {(review.name ?? 'A').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">{review.name ?? 'Anonymous'}</p>
                    <p className="text-xs text-surface-800/40">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related venues */}
        {similarVenues.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-brand-600 text-sm font-medium">Related venues</p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-surface-900 mt-2 text-balance">
                  Explore more spaces for <span className="font-black">your next game.</span>
                </h2>
              </div>
              <Link href="/venues" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0">
                View All Venues <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {similarVenues.map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-50/95 backdrop-blur-xl border-t border-surface-200 p-3 shadow-lg">
        <a
          href="#book-a-slot"
          className="block w-full text-center px-4 py-3 bg-brand-600 text-white rounded-full text-sm font-semibold"
        >
          Book a Slot
        </a>
      </div>
    </div>
  )
}
