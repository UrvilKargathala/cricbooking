'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
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
  Users,
  Ruler,
} from 'lucide-react'
import { SlotPicker } from '@/components/booking/SlotPicker'
import { VenueGallery } from '@/components/venue/VenueGallery'
import { VenueCard } from '@/components/venue/VenueCard'
import { createClient } from '@/lib/supabase'
import { fetchSlots, fetchVenueReviews, fetchVenues } from '@/lib/supabase-queries'
import { AMENITY_LABELS, AMENITY_ICONS, SPORT_LABELS, SURFACE_LABELS, formatPrice, formatTime } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import { useToastStore } from '@/store/useToastStore'
import { useAuth } from '@/hooks/useAuth'
import type { Slot, Venue, Review } from '@/types'

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

  const handleBook = async (selectedSlots: Slot[], totalAmount: number) => {
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
        theme: { color: '#16a34a' },
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

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">
        <nav className="flex items-center flex-wrap gap-1 text-sm text-surface-800/60 mb-6">
          <Link href="/" className="hover:text-surface-800">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/venues" className="hover:text-surface-800">Venues</Link>
          {venue.area && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/venues?area=${venue.area.slug}`} className="hover:text-surface-800">{venue.area.name}</Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-surface-800 font-medium">{venue.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <VenueGallery images={venue.images.length ? venue.images : venue.cover_image ? [venue.cover_image] : []} alt={venue.name} />

            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-surface-900">{venue.name}</h1>
                    {venue.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified Venue
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-surface-800">{venue.rating.toFixed(1)}</span>
                    <span className="text-sm text-surface-800/50">({venue.total_reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleFavorite}
                    aria-label={favorite ? 'Remove from wishlist' : 'Save venue'}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-100"
                  >
                    <Heart className={favorite ? 'w-4 h-4 fill-red-500 text-red-500' : 'w-4 h-4 text-surface-800/60'} />
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share venue"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-100"
                  >
                    <Share2 className="w-4 h-4 text-surface-800/60" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-surface-800">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-surface-800/50" />
                  {venue.address}
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-xs font-medium"
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </a>
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-surface-800/50" />
                  {formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}
                </span>
                {venue.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-surface-800/50" />
                    {venue.phone}
                  </span>
                )}
              </div>

              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block rounded-lg overflow-hidden border border-surface-200 h-40"
              >
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(venue.address)}&z=15&output=embed`}
                  className="w-full h-full pointer-events-none"
                  loading="lazy"
                  title={`Map showing location of ${venue.name}`}
                />
              </a>

              {venue.phone && (
                <div className="mt-4 flex gap-2">
                  <a
                    href={`tel:${venue.phone}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-surface-200 text-sm font-medium text-surface-800 hover:bg-surface-100"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}

              {venue.description && (
                <p className="mt-4 text-sm text-surface-800/80 leading-relaxed">{venue.description}</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h2 className="font-display font-semibold text-surface-900 mb-3">Sports</h2>
              <div className="flex flex-wrap gap-2">
                {venue.sports.map((sport) => (
                  <span key={sport} className="bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {SPORT_LABELS[sport] ?? sport}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h2 className="font-display font-semibold text-surface-900 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {venue.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity]
                  return (
                    <span key={amenity} className="flex items-center gap-2 text-sm text-surface-800">
                      {Icon ? (
                        <Icon className="w-4 h-4 text-brand-600 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                      )}
                      {AMENITY_LABELS[amenity] ?? amenity}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h2 className="font-display font-semibold text-surface-900 mb-3">Courts & Pricing</h2>
              <div className="flex flex-col gap-2">
                {venue.courts?.map((court) => (
                  <div key={court.id} className="flex items-center justify-between bg-surface-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-surface-900">{court.name}</p>
                      <p className="text-xs text-surface-800/60">
                        {SURFACE_LABELS[court.surface] ?? court.surface} · {SPORT_LABELS[court.sport] ?? court.sport}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-surface-800/50">
                        {court.max_players > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Up to {court.max_players} players
                          </span>
                        )}
                        {court.dimensions && (
                          <span className="flex items-center gap-1">
                            <Ruler className="w-3 h-3" />
                            {court.dimensions}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-semibold text-brand-700">{formatPrice(court.price_per_slot)}</p>
                      <p className="text-xs text-surface-800/50">
                        {court.weekend_price && `${formatPrice(court.weekend_price)} weekend`}
                        {court.weekend_price && court.night_price && ' · '}
                        {court.night_price && `${formatPrice(court.night_price)} night`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h2 className="font-display font-semibold text-surface-900 mb-3">Policies</h2>
              <ul className="flex flex-col gap-2 text-sm text-surface-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Book at least {venue.min_advance_hours} hour(s) in advance
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Bookings open up to {venue.max_advance_days} days ahead
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Cancel {venue.cancellation_hours}+ hours before for {venue.cancellation_refund_pct}% refund
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <h2 className="font-display font-semibold text-surface-900">Reviews</h2>
                <div className="flex items-center gap-3">
                  {venue.total_reviews > 0 && (
                    <span className="flex items-center gap-1 text-sm text-surface-800">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {venue.rating.toFixed(1)}
                      <span className="text-surface-800/50">({venue.total_reviews})</span>
                    </span>
                  )}
                  {sortedReviews.length > 1 && (
                    <select
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value as ReviewSort)}
                      className="px-2 py-1 bg-surface-100 border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-400"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  )}
                </div>
              </div>
              {sortedReviews.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {sortedReviews.map((review) => (
                    <div key={review.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-display font-semibold text-sm flex items-center justify-center shrink-0">
                        {(review.name ?? 'A').charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-surface-900">{review.name ?? 'Anonymous'}</p>
                          <span className="text-xs text-surface-800/40">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                        <p className="text-sm text-surface-800/80 mt-1.5 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-800/60">No reviews yet — be the first to play and review.</p>
              )}
            </div>
          </div>

          <div>
            <div id="book-a-slot" className="bg-white rounded-xl border border-surface-200 p-5 sticky top-20 scroll-mt-20">
              <h2 className="font-display font-semibold text-surface-900 mb-3">Book a Slot</h2>
              {venue.courts && venue.courts.length > 0 ? (
                <SlotPicker
                  courts={venue.courts}
                  slots={slots}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onBook={handleBook}
                  justUpdated={justUpdated}
                  bookingLoading={bookingLoading}
                />
              ) : (
                <p className="text-sm text-surface-800/60">No courts available for this venue.</p>
              )}
            </div>
          </div>
        </div>

        {similarVenues.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display font-bold text-xl text-surface-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarVenues.map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200 p-3 shadow-lg">
        <a
          href="#book-a-slot"
          className="block w-full text-center px-4 py-3 bg-brand-600 text-white rounded-full text-sm font-semibold"
        >
          Book a Slot
        </a>
      </div>
    </>
  )
}
