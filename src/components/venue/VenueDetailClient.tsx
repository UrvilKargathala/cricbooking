'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Star,
  MapPin,
  Clock,
  Check,
  Share2,
  Heart,
  Navigation,
  Phone,
  MessageCircle,
  Users,
} from 'lucide-react'
import { SlotPicker } from '@/components/booking/SlotPicker'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { VenueCard } from '@/components/venue/VenueCard'
import { createClient } from '@/lib/supabase'
import { fetchOpenSlotCountsByDate, fetchSlots, fetchVenueReviews, fetchVenues } from '@/lib/supabase-queries'
import { AMENITY_LABELS, SPORT_LABELS, SURFACE_LABELS, formatPrice, formatTime } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import { useToastStore } from '@/store/useToastStore'
import { useAuth } from '@/hooks/useAuth'
import type { Court, Slot, Venue, Review } from '@/types'

export function VenueDetailClient({ venue }: { venue: Venue }) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [preselectTime, setPreselectTime] = useState<string | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [justUpdated, setJustUpdated] = useState<Set<string>>(new Set())
  const [reviews, setReviews] = useState<(Review & { name?: string })[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [similarVenues, setSimilarVenues] = useState<Venue[]>([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [schedule, setSchedule] = useState<{ slots: Slot[]; court: Court | null }>({
    slots: [],
    court: null,
  })
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(venue.id)
  const showToast = useToastStore((s) => s.showToast)
  const { user } = useAuth()
  const [openCounts, setOpenCounts] = useState<Record<string, number> | null>(null)
  const reviewCount = reviews.length
  const averageRating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0
  const hasRating = reviewCount > 0
  const photos = useMemo(
    () => Array.from(new Set([venue.cover_image, ...(venue.images ?? [])].filter((src): src is string => Boolean(src)))).slice(0, 3),
    [venue.cover_image, venue.images]
  )
  const courts = useMemo(() => venue.courts ?? [], [venue.courts])
  const phoneDigits = venue.phone ? venue.phone.replace(/\D/g, '') : ''
  const phoneIntl = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits
  const priceNote = useMemo(() => {
    const parts = new Set<string>()
    courts.forEach((court) => {
      const bits = [`Weekdays ${formatPrice(court.price_per_slot)}`]
      if (court.weekend_price && court.weekend_price !== court.price_per_slot) bits.push(`weekends ${formatPrice(court.weekend_price)}`)
      if (court.night_price && court.night_price !== court.price_per_slot) bits.push(`after 6 PM ${formatPrice(court.night_price)}`)
      parts.add(`${courts.length > 1 ? `${court.name}: ` : ''}${bits.join(' · ')} per hour`)
    })
    return Array.from(parts)
  }, [courts])

  useEffect(() => {
    fetchVenueReviews(venue.id)
      .then((data) =>
        setReviews(
          data.map((r) => ({
            ...r,
            name: (r as unknown as Record<string, unknown>).user
              ? ((r as unknown as Record<string, unknown>).user as Record<string, string>).full_name
              : 'Player',
          }))
        )
      )
      .catch(() => {})

    fetchVenues()
      .then((all) => {
        const score = (v: Venue) =>
          (v.area_id && v.area_id === venue.area_id ? 2 : 0) + (v.sports?.some((sport) => venue.sports?.includes(sport)) ? 1 : 0)
        setSimilarVenues(
          all
            .filter((v) => v.id !== venue.id && (v.courts?.length ?? 0) > 0 && Boolean(v.description))
            .sort((a, b) => score(b) - score(a) || Number(b.is_featured) - Number(a.is_featured))
            .slice(0, 3)
        )
      })
      .catch(() => {})
  }, [venue.id, venue.area_id, venue.sports])

  const loadOpenCounts = useCallback(() => {
    if (!courts.length) return
    const now = new Date()
    const today = format(now, 'yyyy-MM-dd')
    const nowTime = format(now, 'HH:mm:ss')
    fetchOpenSlotCountsByDate(
      courts.map((c) => c.id),
      today,
      format(addDays(now, 13), 'yyyy-MM-dd')
    )
      .then((rows) => {
        const counts: Record<string, number> = {}
        rows.forEach((row) => {
          if (row.date === today && row.start_time <= nowTime) return
          counts[row.date] = (counts[row.date] ?? 0) + 1
        })
        setOpenCounts(counts)
      })
      .catch(() => setOpenCounts(null))
  }, [courts])

  useEffect(() => {
    loadOpenCounts()
  }, [loadOpenCounts, slots])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const date = params.get('date')
    const time = params.get('time')
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= format(new Date(), 'yyyy-MM-dd')) setSelectedDate(date)
    if (time && /^\d{2}:\d{2}$/.test(time)) setPreselectTime(time)
  }, [])

  useEffect(() => {
    if (!venue.courts?.length) {
      setSlotsLoading(false)
      return
    }
    setSlotsLoading(true)
    Promise.all(venue.courts.map((c) => fetchSlots(c.id, selectedDate)))
      .then((results) => setSlots(results.flat()))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [venue.courts, selectedDate])

  useEffect(() => {
    if (!venue.courts?.length) return
    const supabase = createClient()
    const channels = venue.courts.map((court) =>
      supabase
        .channel(`slots-${court.id}-${selectedDate}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'slots', filter: `court_id=eq.${court.id}` },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setSlots((prev) =>
                prev.map((s) =>
                  s.id === payload.new.id ? { ...s, status: payload.new.status, blocked_reason: payload.new.blocked_reason } : s
                )
              )
              setJustUpdated((prev) => new Set(prev).add(payload.new.id))
              setTimeout(
                () =>
                  setJustUpdated((prev) => {
                    const next = new Set(prev)
                    next.delete(payload.new.id)
                    return next
                  }),
                2000
              )
              if (payload.new.status === 'booked' || payload.new.status === 'blocked') {
                showToast('A slot was just booked by another player', 'info')
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
    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch))
    }
  }, [venue.courts, selectedDate, showToast])

  const handleSelectionChange = useCallback((selectedSlots: Slot[], court: Court | null) => {
    setSchedule({ slots: selectedSlots, court })
  }, [])

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(venue.id)
    if (result === 'signed_out') router.push('/login')
  }

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
        const err = await res.json().catch(() => ({}))
        showToast(err.error || 'Could not start payment. Please try again.', 'error')
        setBookingLoading(false)
        return
      }

      const { order_id, amount, currency } = await res.json()
      const slotIds = selectedSlots.map((s) => s.id)

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
        theme: { color: '#042644' },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, slot_ids: slotIds, venue_id: venue.id, court_id: courtId }),
            })
            if (verifyRes.ok) {
              const { bookings } = await verifyRes.json()
              const codes = bookings.map((b: { booking_code: string }) => b.booking_code).join(',')
              router.push(`/bookings/confirmed?codes=${codes}`)
            } else {
              showToast('Payment received but the booking could not be confirmed. Please contact support with your payment ID.', 'error')
            }
          } catch {
            showToast('Payment received but we could not confirm the booking. Please contact support with your payment ID.', 'error')
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
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!', 'info')
    }
  }

  const mainPhoto = photos[0] ?? '/figma/venue-surat-arena.png'

  return (
    <div
      className={`w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 ${
        schedule.slots.length > 0 ? 'pb-24 lg:pb-10' : ''
      }`}
    >
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 text-[14px] text-[#50555c] hover:text-black font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to turfs</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className="size-9 rounded-full bg-[#f4f6f8] hover:bg-[#eef1f4] flex items-center justify-center text-black transition-colors"
            aria-label="Save to favorites"
          >
            <Heart className={favorite ? 'size-4 fill-red-500 text-red-500' : 'size-4'} />
          </button>
          <button
            onClick={handleShare}
            className="size-9 rounded-full bg-[#f4f6f8] hover:bg-[#eef1f4] flex items-center justify-center text-black transition-colors"
            aria-label="Share venue"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          PHOTO GALLERY (V2 FIGMA NODE 157:3887)
          ======================================================== */}
      <div className={`grid grid-cols-1 gap-4 mb-8 sm:mb-12 ${photos.length > 1 ? 'lg:grid-cols-12' : ''}`}>
        <div
          className={`relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#dde3ea] ${
            photos.length > 1 ? 'lg:col-span-8 aspect-[16/10]' : 'aspect-[16/10] sm:aspect-[21/9]'
          }`}
        >
          <Image src={mainPhoto} alt={venue.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
          {venue.is_featured && (
            <div className="absolute top-4 left-4 bg-[#F59E0B] px-3.5 py-1.5 rounded-full text-[13px] font-medium text-black shadow-sm">
              Featured turf
            </div>
          )}
        </div>

        {photos.length > 1 && (
          <div className={`lg:col-span-4 grid gap-4 ${photos.length > 2 ? 'grid-cols-2 lg:grid-cols-1 lg:grid-rows-2' : 'grid-cols-1'}`}>
            {photos.slice(1).map((src) => (
              <div key={src} className="relative aspect-[16/10] lg:aspect-auto w-full h-full rounded-[20px] sm:rounded-[24px] overflow-hidden bg-[#dde3ea]">
                <Image src={src} alt={`${venue.name} photo`} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          TITLE & BADGES ROW
          ======================================================== */}
      <div className="flex flex-col gap-3 pb-8 mb-8 border-b border-[#e3e5e8]">
        <h1 className="text-[34px] sm:text-[44px] font-normal tracking-[-1.5px] text-black leading-tight">
          {venue.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5 text-[14px]">
          {hasRating ? (
            <div className="bg-[#F59E0B] px-3 py-1 rounded-full text-black font-medium flex items-center gap-1">
              <Star className="size-3.5 fill-black text-black" />
              <span>{averageRating.toFixed(1)}</span>
              <span className="text-black/60">({reviewCount})</span>
            </div>
          ) : (
            <span className="bg-[#F59E0B] px-3 py-1 rounded-full text-black font-medium">New on CricBooking</span>
          )}

          <span className="bg-[#f4f6f8] px-3.5 py-1 rounded-full text-[#404449]">
            {venue.area?.name || 'Surat'}
          </span>

          <span className="bg-[#f4f6f8] px-3.5 py-1 rounded-full text-[#404449]">
            {venue.courts?.length || 1} court{venue.courts?.length === 1 ? '' : 's'}
          </span>

          <span className="bg-[#f4f6f8] px-3.5 py-1 rounded-full text-[#404449] flex items-center gap-1.5">
            <Clock className="size-3.5 text-[#6c6c6c]" />
            <span>
              {venue.opening_time ? formatTime(venue.opening_time) : '6 AM'} –{' '}
              {venue.closing_time ? formatTime(venue.closing_time) : '11 PM'}
            </span>
          </span>
        </div>
      </div>

      {/* ========================================================
          MAIN TWO-COLUMN WORKFLOW
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Slots & Details) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Slot Picker Card */}
          <div id="book-a-slot" className="bg-[#f4f6f8] rounded-[28px] p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-[24px] font-medium tracking-tight text-black">Select your slot</h2>
              <p className="text-[14px] text-[#50555c] mt-0.5">
                Choose a date, then tap back-to-back hours to book them together.
              </p>
              {priceNote.length > 0 && (
                <div className="mt-3 flex flex-col gap-1">
                  {priceNote.map((line) => (
                    <p key={line} className="text-[13px] text-[#92400E]">{line}</p>
                  ))}
                </div>
              )}
            </div>

            {venue.courts && venue.courts.length > 0 ? (
              <SlotPicker
                courts={venue.courts}
                slots={slots}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onSelectionChange={handleSelectionChange}
                loading={slotsLoading}
                preselectTime={preselectTime}
                justUpdated={justUpdated}
                openCounts={openCounts}
              />
            ) : (
              <p className="text-[14px] text-[#50555c]">This turf hasn&apos;t added courts for online booking yet. Call the venue to book.</p>
            )}
          </div>

          {/* About & Amenities */}
          <div className="bg-[#f4f6f8] rounded-[28px] p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-[22px] font-medium tracking-tight text-black">About this venue</h2>
              <p className="text-[15px] text-[#404449] mt-3 leading-relaxed">
                {venue.description && venue.description.length > 40
                  ? venue.description
                  : `${venue.name} is a ${(venue.sports ?? []).map((sport) => SPORT_LABELS[sport] ?? sport).join(' and ').toLowerCase() || 'cricket'} venue in ${venue.area?.name || 'Surat'} with ${courts.length || 1} ${courts.length === 1 ? 'court' : 'courts'}, open ${formatTime(venue.opening_time)} to ${formatTime(venue.closing_time)}.${venue.description ? ` ${venue.description}` : ''}`}
              </p>
            </div>

            {courts.length > 0 && (
              <div>
                <h3 className="text-[16px] font-medium text-black mb-3">Courts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courts.map((court) => (
                    <div key={court.id} className="rounded-2xl border border-[#e3e5e8] bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[15px] font-medium text-black">{court.name}</p>
                        <p className="text-[13px] text-[#50555c] whitespace-nowrap">from {formatPrice(court.price_per_slot)}/hr</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#50555c]">
                        <span>{SURFACE_LABELS[court.surface] ?? court.surface}</span>
                        {court.dimensions && <span>{court.dimensions.replace(/x/i, ' × ')}</span>}
                        <span className="inline-flex items-center gap-1"><Users className="size-3.5" />Up to {court.max_players} players</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {venue.amenities && venue.amenities.length > 0 && (
              <div>
                <h3 className="text-[16px] font-medium text-black mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-white px-3.5 py-1.5 rounded-full text-[13px] text-black border border-[#e3e5e8] flex items-center gap-1.5"
                    >
                      <Check className="size-3.5 text-[#92400E]" strokeWidth={2.5} />
                      <span>{AMENITY_LABELS[amenity] || amenity}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location & Directions */}
          <div className="bg-[#f4f6f8] rounded-[28px] p-6 sm:p-8 flex flex-col gap-4">
            <h2 className="text-[22px] font-medium tracking-tight text-black">Location & contact</h2>
            <p className="text-[15px] text-[#404449] flex items-start gap-2">
              <MapPin className="size-4 text-[#92400E] shrink-0 mt-0.5" />
              <span>{venue.address}{venue.area?.name ? `, ${venue.area.name}` : ''}, Surat</span>
            </p>
            <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl border border-[#e3e5e8] bg-[#e6ebee]">
              <iframe
                title={`Map showing ${venue.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${venue.address}, ${venue.area?.name ?? ''}, Surat, Gujarat`)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0"
              />
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.address}, Surat`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e3e5e8] px-4 py-2 text-[14px] font-medium text-black hover:border-[#042644]/40"
              >
                <Navigation className="size-3.5" />
                Directions
              </a>
              {phoneDigits && (
                <a
                  href={`tel:+${phoneIntl}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e3e5e8] px-4 py-2 text-[14px] font-medium text-black hover:border-[#042644]/40"
                >
                  <Phone className="size-3.5" />
                  Call venue
                </a>
              )}
              {phoneDigits && (
                <a
                  href={`https://wa.me/${phoneIntl}?text=${encodeURIComponent(`Hi, I found ${venue.name} on CricBooking and have a question.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e3e5e8] px-4 py-2 text-[14px] font-medium text-black hover:border-[#042644]/40"
                >
                  <MessageCircle className="size-3.5" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-[#f4f6f8] rounded-[28px] p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-medium tracking-tight text-black">Player reviews</h2>
              <span className="text-[14px] text-[#6c6c6c]">
                {hasRating ? `★ ${averageRating.toFixed(1)} · ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
              </span>
            </div>

            {reviews.length ? (
              <div className="flex flex-col gap-3">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="size-7 shrink-0 rounded-full bg-[#F59E0B] text-black text-xs font-semibold flex items-center justify-center">
                          {(review.name || 'P').slice(0, 1).toUpperCase()}
                        </span>
                        <span className="text-[14px] font-medium text-black truncate">{review.name || 'Player'}</span>
                      </div>
                      <span className="text-black text-[13px]" aria-label={`${review.rating} out of 5 stars`}>
                        {'★'.repeat(review.rating)}
                        <span className="text-[#c6ccd1]">{'★'.repeat(Math.max(0, 5 - review.rating))}</span>
                      </span>
                    </div>
                    {review.comment ? <p className="text-[13px] text-[#404449]">{review.comment}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-[#50555c]">No reviews yet. Played here? Share how it went after your game.</p>
            )}
          </div>
        </div>

        {/* Right Column (Sticky Summary) */}
        <div className="lg:col-span-4 w-full lg:self-stretch">
          <BookingSummary
            cancellationHours={venue.cancellation_hours ?? null}
            refundPct={venue.cancellation_refund_pct ?? null}
            court={schedule.court}
            selectedDate={selectedDate}
            selectedSlots={schedule.slots}
            areaName={venue.area?.name}
            onBook={handleBook}
            loading={bookingLoading}
          />
        </div>
      </div>

      {/* Similar Venues */}
      {similarVenues.length > 0 && (
        <div className="mt-16 sm:mt-24 pt-10 border-t border-[#e3e5e8]">
          <h2 className="text-[26px] sm:text-[30px] font-normal tracking-tight text-black mb-6">
            Other turfs you might like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similarVenues.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar (<1024px) when at least 1 slot is selected */}
      {schedule.slots.length > 0 && (
        <div
          id="venue-mobile-bar"
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#e3e5e8] px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,0.08)]"
        >
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] text-[#50555c]">
                <span className="font-medium text-black truncate max-w-[120px]">
                  {schedule.court?.name ?? 'Court 1'}
                </span>
                <span>·</span>
                <span>
                  {schedule.slots.length} slot{schedule.slots.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-[18px] sm:text-[20px] font-medium text-black leading-tight mt-0.5">
                {formatPrice(schedule.slots.reduce((sum, s) => sum + s.price, 0))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleBook}
              disabled={bookingLoading}
              className="group bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-5 pr-2 py-2.5 rounded-full text-[14px] sm:text-[15px] font-medium flex items-center gap-2.5 shrink-0 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span>{bookingLoading ? 'Processing...' : 'Proceed to pay'}</span>
              <span className="size-7 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
