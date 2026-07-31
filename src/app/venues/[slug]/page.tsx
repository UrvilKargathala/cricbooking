'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Star, MapPin, Clock, Phone, Check } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SlotPicker } from '@/components/booking/SlotPicker'
import { DEMO_VENUES, generateDemoSlots } from '@/lib/demo-data'
import { AMENITY_LABELS, SPORT_LABELS, SURFACE_LABELS, formatPrice, formatTime } from '@/lib/utils'
import type { Slot } from '@/types'

export default function VenueDetailPage({ params }: { params: { slug: string } }) {
  const venue = DEMO_VENUES.find((v) => v.slug === params.slug)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))

  if (!venue) notFound()

  const slots = useMemo(
    () => (venue.courts ?? []).flatMap((court) => generateDemoSlots(court.id, selectedDate)),
    [venue.courts, selectedDate]
  )

  const handleBook = (selectedSlots: Slot[], totalAmount: number) => {
    alert(`Booked ${selectedSlots.length} slot(s) for ${formatPrice(totalAmount)}. Confirmation coming soon!`)
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/venues" className="inline-flex items-center gap-1 text-sm text-surface-800/60 hover:text-surface-800 mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Venues
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-200 to-brand-600 flex items-center justify-center">
              <span className="font-display font-bold text-6xl text-white/80">{venue.name.charAt(0)}</span>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-surface-900">{venue.name}</h1>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-surface-800">{venue.rating.toFixed(1)}</span>
                <span className="text-sm text-surface-800/50">({venue.total_reviews} reviews)</span>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-surface-800">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-surface-800/50" />
                  {venue.address}
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
                      {court.weekend_price && (
                        <p className="text-xs text-surface-800/50">{formatPrice(court.weekend_price)} weekend</p>
                      )}
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
          </div>

          <div>
            <div className="bg-white rounded-xl border border-surface-200 p-5 sticky top-20">
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
      </main>
      <Footer />
    </>
  )
}
