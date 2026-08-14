'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, Edit2 } from 'lucide-react'
import { DEMO_VENUES, DEMO_ADMIN_VENUES, DEMO_AREAS } from '@/lib/demo-data'
import { loadLocalVenues, saveLocalVenues } from '@/lib/local-venues'
import { SPORT_LABELS, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { VenueForm } from '@/components/venue/VenueForm'
import type { Venue, VenueFormData } from '@/types'

function performanceFor(venue: Venue) {
  const adminMatch = DEMO_ADMIN_VENUES.find((v) => v.name === venue.name)
  if (adminMatch) return { bookings: adminMatch.bookings_count, revenue: adminMatch.revenue }
  const price = venue.courts?.[0]?.price_per_slot ?? 700
  return { bookings: venue.total_reviews, revenue: venue.total_reviews * price }
}

function formDataToVenue(data: VenueFormData): Venue {
  const area = DEMO_AREAS.find((a) => a.slug === data.area)
  const images = data.photos.map((f) => URL.createObjectURL(f))
  return {
    id: crypto.randomUUID(),
    owner_id: 'owner1',
    name: data.name,
    slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: data.description || null,
    address: data.address,
    area_id: area?.id ?? null,
    city: 'Surat',
    phone: data.phone ? `+91${data.phone}` : null,
    cover_image: images[0] ?? null,
    images,
    amenities: data.amenities,
    sports: data.sports,
    opening_time: data.opening_time,
    closing_time: data.closing_time,
    slot_duration_mins: data.slot_duration,
    min_advance_hours: data.min_advance_hours,
    max_advance_days: data.max_advance_days,
    cancellation_hours: data.cancellation_hours,
    cancellation_refund_pct: data.cancellation_refund_pct,
    rating: 0,
    total_reviews: 0,
    status: 'approved',
    is_featured: false,
    created_at: new Date().toISOString(),
    area,
    courts: data.courts.map((c) => ({
      id: c.id,
      venue_id: '',
      name: c.name,
      surface: c.surface,
      sport: c.sport,
      max_players: c.max_players,
      dimensions: c.dimensions || null,
      price_per_slot: c.price_per_slot,
      weekend_price: c.weekend_price || null,
      night_price: c.night_price || null,
      is_active: true,
    })),
  }
}

export default function DashboardVenuesPage() {
  const [myVenues, setMyVenues] = useState(() => DEMO_VENUES.slice(0, 2))
  const [showForm, setShowForm] = useState(false)

  // Merge in browser-local venues after mount only, so the server-rendered HTML
  // (which never sees localStorage) matches the client's first paint.
  useEffect(() => {
    setMyVenues((prev) => [...prev, ...loadLocalVenues()])
  }, [])

  const handleSubmit = (data: VenueFormData) => {
    const venue = formDataToVenue(data)
    setMyVenues((prev) => {
      const next = [...prev, venue]
      saveLocalVenues(next.filter((v) => !DEMO_VENUES.some((d) => d.id === v.id)))
      return next
    })
    alert('Venue "' + data.name + '" has been added to your account. You can start managing it right away.')
    setShowForm(false)
  }

  if (showForm) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-surface-900">Add New Venue</h3>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
        <VenueForm isInsideDashboard onSubmit={handleSubmit} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-xl text-surface-900">My Venues</h1>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Venue
        </Button>
      </div>

      {myVenues.map((venue) => {
        const performance = performanceFor(venue)
        return (
        <div key={venue.id} className="bg-white rounded-xl border border-surface-200 p-4 mb-4 flex gap-4 items-start">
          <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
            {venue.cover_image ? (
              <img src={venue.cover_image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-2xl text-brand-300">{venue.name[0]}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-surface-900">{venue.name}</h3>
            <p className="text-sm text-surface-800/60 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {venue.address}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-surface-800/50">
              <span>{venue.courts?.length || 0} Courts</span>
              <span>{venue.sports.map((s) => SPORT_LABELS[s]).join(', ')}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-medium">
              <span className="text-surface-800/70">{performance.bookings} bookings</span>
              <span className="text-emerald-700">{formatPrice(performance.revenue)} revenue</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {venue.sports.map((sport) => (
                <span key={sport} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800">
                  {SPORT_LABELS[sport]}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={venue.status as 'approved'}>{venue.status}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => alert('Venue editing coming in next phase.')}
              className="flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
        </div>
        )
      })}
    </div>
  )
}
