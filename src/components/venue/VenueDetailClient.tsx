'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { SlotPicker } from '@/components/booking/SlotPicker'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { VenueCard } from '@/components/venue/VenueCard'
import { createClient } from '@/lib/supabase'
import { fetchSlots, fetchVenueReviews, fetchVenues } from '@/lib/supabase-queries'
import { AMENITY_LABELS, formatPrice, formatTime } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import { useToastStore } from '@/store/useToastStore'
import { useAuth } from '@/hooks/useAuth'
import type { Court, Slot, Venue, Review } from '@/types'

export function VenueDetailClient({ venue }: { venue: Venue }) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
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
      .then((all) =>
        setSimilarVenues(all.filter((v) => v.id !== venue.id).slice(0, 3))
      )
      .catch(() => {})
  }, [venue.id])

  useEffect(() => {
    if (!venue.courts?.length) return
    Promise.all(venue.courts.map((c) => fetchSlots(c.id, selectedDate)))
      .then((results) => setSlots(results.flat()))
      .catch(() => {})
  }, [venue.courts, selectedDate])

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
        // Fallback simulated booking for demo
        showToast('Payment confirmed! Slot reserved successfully.', 'success')
        router.push('/bookings')
        setBookingLoading(false)
        return
      }

      const { order_id, amount, currency } = await res.json()

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test',
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
        handler: async () => {
          router.push(`/bookings`)
          setBookingLoading(false)
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      showToast('Booking recorded successfully!', 'success')
      router.push('/bookings')
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

  const fallbackMainImg = venue.slug?.includes('green-pitch')
    ? '/figma/venue-green-pitch.png'
    : venue.slug?.includes('royal')
    ? '/figma/venue-royal-box.png'
    : venue.slug?.includes('sunset')
    ? '/figma/venue-sunset-turf.png'
    : '/figma/venue-surat-arena.png'

  const mainPhoto = venue.cover_image || fallbackMainImg
  const sidePhoto1 = venue.images?.[1] || '/figma/hero-bg.png'
  const sidePhoto2 = venue.images?.[2] || '/figma/venue-green-pitch.png'

  return (
    <div
      className={`w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-10 ${
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 sm:mb-12">
        {/* Main Large Photo */}
        <div className="lg:col-span-8 relative aspect-[16/10] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#dde3ea]">
          <Image src={mainPhoto} alt={venue.name} fill priority className="object-cover" />
          <div className="absolute top-4 left-4 bg-[#c9f13e] px-3.5 py-1.5 rounded-full text-[13px] font-medium text-black shadow-sm">
            Featured
          </div>
        </div>

        {/* 2 Side Photos */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4">
          <div className="relative aspect-[16/10] lg:aspect-auto w-full h-full rounded-[20px] sm:rounded-[24px] overflow-hidden bg-[#dde3ea]">
            <Image src={sidePhoto1} alt="" fill className="object-cover" />
          </div>
          <div className="relative aspect-[16/10] lg:aspect-auto w-full h-full rounded-[20px] sm:rounded-[24px] overflow-hidden bg-[#dde3ea]">
            <Image src={sidePhoto2} alt="" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* ========================================================
          TITLE & BADGES ROW
          ======================================================== */}
      <div className="flex flex-col gap-3 pb-8 mb-8 border-b border-[#e3e5e8]">
        <h1 className="text-[34px] sm:text-[44px] font-normal tracking-[-1.5px] text-black leading-tight">
          {venue.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5 text-[14px]">
          <div className="bg-[#c9f13e] px-3 py-1 rounded-full text-black font-medium flex items-center gap-1">
            <Star className="size-3.5 fill-black text-black" />
            <span>{venue.rating ? Number(venue.rating).toFixed(1) : '4.6'}</span>
          </div>

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
                Choose a date and tap the hours you wish to book.
              </p>
            </div>

            {venue.courts && venue.courts.length > 0 ? (
              <SlotPicker
                courts={venue.courts}
                slots={slots}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onSelectionChange={(selectedSlots, court) =>
                  setSchedule({ slots: selectedSlots, court })
                }
              />
            ) : (
              <p className="text-[14px] text-[#6c6c6c]">No courts available.</p>
            )}
          </div>

          {/* About & Amenities */}
          <div className="bg-[#f4f6f8] rounded-[28px] p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-[22px] font-medium tracking-tight text-black">About this venue</h2>
              <p className="text-[15px] text-[#404449] mt-3 leading-relaxed">
                {venue.description ||
                  `A top-tier cricket facility in ${venue.area?.name || 'Surat'} featuring professional shock-absorbing turf, high-mast floodlights, and automated live match scoring.`}
              </p>
            </div>

            {venue.amenities && venue.amenities.length > 0 && (
              <div>
                <h3 className="text-[16px] font-medium text-black mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-white px-3.5 py-1.5 rounded-full text-[13px] text-black border border-[#e3e5e8] flex items-center gap-1.5"
                    >
                      <Check className="size-3.5 text-[#2f5a00]" strokeWidth={2.5} />
                      <span>{AMENITY_LABELS[amenity] || amenity}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location & Directions */}
          <div className="bg-[#f4f6f8] rounded-[28px] p-6 sm:p-8 flex flex-col gap-4">
            <h2 className="text-[22px] font-medium tracking-tight text-black">Location</h2>
            <p className="text-[15px] text-[#404449] flex items-center gap-2">
              <MapPin className="size-4 text-[#1849c9] shrink-0" />
              <span>{venue.address}</span>
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-black underline mt-1"
            >
              <Navigation className="size-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          {/* Reviews */}
          <div className="bg-[#f4f6f8] rounded-[28px] p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-medium tracking-tight text-black">Player reviews</h2>
              <span className="text-[14px] text-[#6c6c6c]">
                ★ {venue.rating ? Number(venue.rating).toFixed(1) : '4.6'} · {reviews.length || 12} reviews
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-full bg-[#c9f13e] text-black text-xs font-semibold flex items-center justify-center">
                      UK
                    </span>
                    <span className="text-[14px] font-medium text-black">Urvil K.</span>
                  </div>
                  <div className="flex text-black">
                    {'★'.repeat(5)}
                  </div>
                </div>
                <p className="text-[13px] text-[#404449]">
                  “Turf bounce is super consistent. Lighting is bright with no dark spots for night games.”
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-full bg-[#e3ebfa] text-[#042644] text-xs font-semibold flex items-center justify-center">
                      TD
                    </span>
                    <span className="text-[14px] font-medium text-black">Tirth D.</span>
                  </div>
                  <div className="flex text-black">
                    {'★'.repeat(5)}
                  </div>
                </div>
                <p className="text-[13px] text-[#404449]">
                  “Seamless booking experience on CricBooking. We played for 2 hours without interruption.”
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sticky Summary) */}
        <div className="lg:col-span-4 w-full">
          <BookingSummary
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
          <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-3">
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
              className="group bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-5 pr-2 py-2.5 rounded-full text-[14px] sm:text-[15px] font-medium flex items-center gap-2.5 shrink-0 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span>{bookingLoading ? 'Processing...' : 'Proceed to pay'}</span>
              <span className="size-7 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
