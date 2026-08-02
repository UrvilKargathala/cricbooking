'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
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
import { VenueGallery } from '@/components/venue/VenueGallery'
import { VenueCard } from '@/components/venue/VenueCard'
import { DEMO_VENUES, DEMO_VENUE_REVIEWS, generateDemoSlots } from '@/lib/demo-data'
import { AMENITY_LABELS, SPORT_LABELS, SURFACE_LABELS, formatPrice, formatTime } from '@/lib/utils'
import type { Slot, Venue } from '@/types'

export function VenueDetailClient({ venue }: { venue: Venue }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [isFavorite, setIsFavorite] = useState(false)

  const slots = useMemo(
    () => (venue.courts ?? []).flatMap((court) => generateDemoSlots(court.id, selectedDate)),
    [venue.courts, selectedDate]
  )

  const reviews = DEMO_VENUE_REVIEWS.filter((r) => r.venue_id === venue.id)

  const similarVenues = DEMO_VENUES.filter(
    (v) => v.id !== venue.id && (v.area?.slug === venue.area?.slug || v.sports.some((s) => venue.sports.includes(s)))
  ).slice(0, 3)

  const handleBook = (selectedSlots: Slot[], totalAmount: number) => {
    alert(`Booked ${selectedSlots.length} slot(s) for ${formatPrice(totalAmount)}. Confirmation coming soon!`)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: venue.name, url })
      } catch {
        // user cancelled share sheet, nothing to do
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  const whatsappHref = venue.phone
    ? `https://wa.me/${venue.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to know more about ${venue.name} on CricBooking.`)}`
    : null

  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">
        <Link href="/venues" className="inline-flex items-center gap-1 text-sm text-surface-800/60 hover:text-surface-800 mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Venues
        </Link>

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
                    onClick={() => setIsFavorite((v) => !v)}
                    aria-label="Save venue"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-200 hover:bg-surface-100"
                  >
                    <Heart className={isFavorite ? 'w-4 h-4 fill-red-500 text-red-500' : 'w-4 h-4 text-surface-800/60'} />
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
                    {SPORT_LABELS[sport]}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h2 className="font-display font-semibold text-surface-900 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {venue.amenities.map((amenity) => (
                  <span key={amenity} className="flex items-center gap-2 text-sm text-surface-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    {AMENITY_LABELS[amenity] ?? amenity}
                  </span>
                ))}
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
                        {SURFACE_LABELS[court.surface]} · {SPORT_LABELS[court.sport]}
                      </p>
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-surface-900">Reviews</h2>
                <span className="flex items-center gap-1 text-sm text-surface-800">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {venue.rating.toFixed(1)}
                  <span className="text-surface-800/50">({venue.total_reviews})</span>
                </span>
              </div>
              {reviews.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-display font-semibold text-sm flex items-center justify-center shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-surface-900">{review.name}</p>
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
