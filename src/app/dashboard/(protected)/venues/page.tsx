'use client'

import { useEffect, useState } from 'react'
import {
  MapPin, Plus, Edit2, Trash2, Users, Ruler, Star,
  BarChart3, IndianRupee, Building2, ChevronDown, ChevronUp, Eye,
} from 'lucide-react'
import Link from 'next/link'
import { DEMO_VENUES, DEMO_ADMIN_VENUES, DEMO_AREAS } from '@/lib/demo-data'
import { loadLocalVenues, saveLocalVenues } from '@/lib/local-venues'
import { SPORT_LABELS, AMENITY_LABELS, AMENITY_ICONS, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { VenueForm } from '@/components/venue/VenueForm'
import { VenueEditForm } from '@/components/venue/VenueEditForm'
import { useToastStore } from '@/store/useToastStore'
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

function VenueCard({
  venue,
  onEdit,
  onDelete,
}: {
  venue: Venue
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const performance = performanceFor(venue)

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-36 sm:h-auto shrink-0 relative overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
          {venue.cover_image ? (
            <img src={venue.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display font-bold text-4xl text-brand-300">{venue.name[0]}</span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant={venue.status as 'approved'}>{venue.status}</Badge>
          </div>
          {venue.is_featured && (
            <div className="absolute top-2 right-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">Featured</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-5 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-lg text-surface-900">{venue.name}</h3>
              <p className="text-sm text-surface-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{venue.address}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-surface-900">{venue.rating}</span>
              <span className="text-sm text-surface-400">({venue.total_reviews})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {venue.sports.map((sport) => (
              <span key={sport} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
                {SPORT_LABELS[sport]}
              </span>
            ))}
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-100 text-surface-600">
              {venue.courts?.length || 0} Courts
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-100 text-surface-600">
              {venue.opening_time} – {venue.closing_time}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-surface-100">
            <div>
              <p className="text-xs text-surface-400">Bookings</p>
              <p className="font-display font-bold text-surface-900 mt-0.5">{performance.bookings}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400">Revenue</p>
              <p className="font-display font-bold text-emerald-600 mt-0.5">{formatPrice(performance.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400">Amenities</p>
              <p className="font-display font-bold text-surface-900 mt-0.5">{venue.amenities.length}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400">Avg Price</p>
              <p className="font-display font-bold text-surface-900 mt-0.5">
                {formatPrice(Math.round((venue.courts ?? []).reduce((s, c) => s + c.price_per_slot, 0) / Math.max(venue.courts?.length ?? 1, 1)))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-100">
            <Button variant="primary" size="sm" onClick={onEdit} className="flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5" />
              Edit Venue
            </Button>
            <Link href={`/venues/${venue.slug}`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Preview
              </Button>
            </Link>
            <button
              onClick={onDelete}
              className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-surface-500 hover:text-surface-700 flex items-center gap-1 px-2 py-1.5"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Details
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-surface-100 p-5 bg-surface-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Courts</h4>
              <div className="space-y-2">
                {(venue.courts ?? []).map((court) => (
                  <div key={court.id} className="bg-white rounded-lg border border-surface-200 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-surface-900">{court.name}</p>
                      <p className="text-xs text-surface-400 mt-0.5 capitalize">{court.surface} · {SPORT_LABELS[court.sport] ?? court.sport}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-surface-500">
                      {court.max_players > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {court.max_players}
                        </span>
                      )}
                      {court.dimensions && (
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3 h-3" />
                          {court.dimensions}
                        </span>
                      )}
                      <span className="font-semibold text-brand-700">{formatPrice(court.price_per_slot)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-surface-700 mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {venue.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity]
                  return (
                    <span key={amenity} className="flex items-center gap-1.5 text-xs bg-white border border-surface-200 rounded-lg px-3 py-2 text-surface-700">
                      {Icon && <Icon className="w-3.5 h-3.5 text-surface-400" />}
                      {AMENITY_LABELS[amenity] ?? amenity}
                    </span>
                  )
                })}
              </div>

              {venue.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-surface-700 mb-1.5">Description</h4>
                  <p className="text-sm text-surface-500 leading-relaxed">{venue.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardVenuesPage() {
  const [myVenues, setMyVenues] = useState(() => DEMO_VENUES.slice(0, 2))
  const [showForm, setShowForm] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const showToast = useToastStore((s) => s.showToast)

  useEffect(() => {
    setMyVenues((prev) => [...prev, ...loadLocalVenues()])
  }, [])

  const totalCourts = myVenues.reduce((s, v) => s + (v.courts?.length ?? 0), 0)
  const totalBookings = myVenues.reduce((s, v) => s + performanceFor(v).bookings, 0)
  const totalRevenue = myVenues.reduce((s, v) => s + performanceFor(v).revenue, 0)

  const handleSubmit = (data: VenueFormData) => {
    const venue = formDataToVenue(data)
    setMyVenues((prev) => {
      const next = [...prev, venue]
      saveLocalVenues(next.filter((v) => !DEMO_VENUES.some((d) => d.id === v.id)))
      return next
    })
    showToast(`"${data.name}" has been added to your account.`, 'success')
    setShowForm(false)
  }

  const handleSaveEdit = (updated: Venue) => {
    setMyVenues((prev) => {
      const next = prev.map((v) => (v.id === updated.id ? updated : v))
      saveLocalVenues(next.filter((v) => !DEMO_VENUES.some((d) => d.id === v.id)))
      return next
    })
    setEditingVenue(null)
    showToast(`"${updated.name}" has been updated.`, 'success')
  }

  const handleDelete = (venue: Venue) => {
    if (!window.confirm(`Delete "${venue.name}"? This can't be undone.`)) return
    setMyVenues((prev) => {
      const next = prev.filter((v) => v.id !== venue.id)
      saveLocalVenues(next.filter((v) => !DEMO_VENUES.some((d) => d.id === v.id)))
      return next
    })
    showToast(`"${venue.name}" has been deleted.`, 'info')
  }

  if (editingVenue) {
    return (
      <VenueEditForm
        venue={editingVenue}
        onSave={handleSaveEdit}
        onCancel={() => setEditingVenue(null)}
      />
    )
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

  const STATS = [
    { label: 'Total Venues', value: String(myVenues.length), icon: Building2, bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Total Courts', value: String(totalCourts), icon: MapPin, bg: 'bg-purple-100', text: 'text-purple-600' },
    { label: 'Total Bookings', value: String(totalBookings), icon: BarChart3, bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: IndianRupee, bg: 'bg-orange-100', text: 'text-orange-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-surface-900">My Venues</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage your cricket turfs and grounds.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Venue
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 px-4 py-3.5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.text}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-surface-900">{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {myVenues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onEdit={() => setEditingVenue(venue)}
            onDelete={() => handleDelete(venue)}
          />
        ))}
      </div>

      {myVenues.length === 0 && (
        <div className="bg-white rounded-xl border border-surface-200 py-16 text-center">
          <Building2 className="w-12 h-12 text-surface-200 mx-auto" />
          <p className="text-surface-500 mt-3 font-medium">No venues yet</p>
          <p className="text-sm text-surface-400 mt-1">Add your first venue to start receiving bookings.</p>
          <Button variant="primary" onClick={() => setShowForm(true)} className="mt-4">
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Venue
          </Button>
        </div>
      )}
    </div>
  )
}
