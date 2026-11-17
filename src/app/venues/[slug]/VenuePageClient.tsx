'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VenueDetailClient } from '@/components/venue/VenueDetailClient'
import { fetchVenueBySlug } from '@/lib/supabase-queries'
import type { Venue } from '@/types'

const DEFAULT_VENUES: Record<string, Venue> = {
  'green-pitch-sports': {
    id: 'v1',
    owner_id: 'owner1',
    name: 'Green Pitch Sports',
    slug: 'green-pitch-sports',
    description:
      'Premier box cricket venue in Varachha with top-tier artificial turf, high-mast floodlights, and live scoring cameras.',
    address: 'Near BRTS Stand, Varachha, Surat',
    area_id: 1,
    city: 'Surat',
    phone: '+91 98765 43210',
    cover_image: '/figma/venue-green-pitch.png',
    images: ['/figma/venue-green-pitch.png', '/figma/hero-bg.png'],
    amenities: ['floodlights', 'turf', 'parking'],
    sports: ['box_cricket'],
    opening_time: '06:00:00',
    closing_time: '23:00:00',
    slot_duration_mins: 60,
    min_advance_hours: 1,
    max_advance_days: 7,
    cancellation_hours: 4,
    cancellation_refund_pct: 100,
    rating: 4.7,
    total_reviews: 84,
    status: 'approved',
    is_featured: true,
    created_at: new Date().toISOString(),
    area: { id: 1, name: 'Varachha', slug: 'varachha' },
    courts: [
      {
        id: 'c1',
        venue_id: 'v1',
        name: 'Court 1',
        sport: 'box_cricket',
        surface: 'turf',
        max_players: 12,
        dimensions: '100x50 ft',
        price_per_slot: 700,
        weekend_price: null,
        night_price: null,
        is_active: true,
      },
    ],
  },
  'surat-cricket-arena': {
    id: 'v2',
    owner_id: 'owner1',
    name: 'Surat Cricket Arena',
    slug: 'surat-cricket-arena',
    description:
      'Top-tier cricket box in Vesu with 2 modern floodlit courts, viewing gallery, and player lounge.',
    address: 'VIP Road, Vesu, Surat',
    area_id: 2,
    city: 'Surat',
    phone: '+91 98765 43211',
    cover_image: '/figma/venue-surat-arena.png',
    images: [
      '/figma/venue-surat-arena.png',
      '/figma/venue-green-pitch.png',
      '/figma/hero-bg.png',
    ],
    amenities: ['floodlights', 'turf', 'viewing_gallery'],
    sports: ['box_cricket'],
    opening_time: '06:00:00',
    closing_time: '23:00:00',
    slot_duration_mins: 60,
    min_advance_hours: 1,
    max_advance_days: 7,
    cancellation_hours: 4,
    cancellation_refund_pct: 100,
    rating: 4.5,
    total_reviews: 120,
    status: 'approved',
    is_featured: true,
    created_at: new Date().toISOString(),
    area: { id: 2, name: 'Vesu', slug: 'vesu' },
    courts: [
      {
        id: 'c2_1',
        venue_id: 'v2',
        name: 'Court 1',
        sport: 'box_cricket',
        surface: 'turf',
        max_players: 12,
        dimensions: '100x50 ft',
        price_per_slot: 600,
        weekend_price: null,
        night_price: null,
        is_active: true,
      },
      {
        id: 'c2_2',
        venue_id: 'v2',
        name: 'Court 2',
        sport: 'box_cricket',
        surface: 'turf',
        max_players: 12,
        dimensions: '100x50 ft',
        price_per_slot: 600,
        weekend_price: null,
        night_price: null,
        is_active: true,
      },
    ],
  },
  'royal-cricket-box': {
    id: 'v3',
    owner_id: 'owner1',
    name: 'Royal Cricket Box',
    slug: 'royal-cricket-box',
    description:
      'Premium cricket ground in Katargam equipped with shock-absorbing turf and boundary netting.',
    address: 'Gajera Circle, Katargam, Surat',
    area_id: 3,
    city: 'Surat',
    phone: '+91 98765 43212',
    cover_image: '/figma/venue-royal-box.png',
    images: ['/figma/venue-royal-box.png'],
    amenities: ['floodlights', 'turf', 'dugout'],
    sports: ['box_cricket'],
    opening_time: '06:00:00',
    closing_time: '23:00:00',
    slot_duration_mins: 60,
    min_advance_hours: 1,
    max_advance_days: 7,
    cancellation_hours: 4,
    cancellation_refund_pct: 100,
    rating: 4.6,
    total_reviews: 52,
    status: 'approved',
    is_featured: false,
    created_at: new Date().toISOString(),
    area: { id: 3, name: 'Katargam', slug: 'katargam' },
    courts: [
      {
        id: 'c3',
        venue_id: 'v3',
        name: 'Court 1',
        sport: 'box_cricket',
        surface: 'turf',
        max_players: 12,
        dimensions: '100x50 ft',
        price_per_slot: 750,
        weekend_price: null,
        night_price: null,
        is_active: true,
      },
    ],
  },
  'sunset-turf-zone': {
    id: 'v4',
    owner_id: 'owner1',
    name: 'Sunset Turf Zone',
    slug: 'sunset-turf-zone',
    description:
      'Open late turf in Pal with night tournament facilities, clean dugout, and refreshment cafe.',
    address: 'Pal-Gaurav Path, Pal, Surat',
    area_id: 4,
    city: 'Surat',
    phone: '+91 98765 43213',
    cover_image: '/figma/venue-sunset-turf.png',
    images: ['/figma/venue-sunset-turf.png'],
    amenities: ['floodlights', 'turf', 'cafe'],
    sports: ['box_cricket'],
    opening_time: '06:00:00',
    closing_time: '00:00:00',
    slot_duration_mins: 60,
    min_advance_hours: 1,
    max_advance_days: 7,
    cancellation_hours: 4,
    cancellation_refund_pct: 100,
    rating: 4.8,
    total_reviews: 96,
    status: 'approved',
    is_featured: false,
    created_at: new Date().toISOString(),
    area: { id: 4, name: 'Pal', slug: 'pal' },
    courts: [
      {
        id: 'c4',
        venue_id: 'v4',
        name: 'Court 1',
        sport: 'box_cricket',
        surface: 'turf',
        max_players: 12,
        dimensions: '100x50 ft',
        price_per_slot: 650,
        weekend_price: null,
        night_price: null,
        is_active: true,
      },
    ],
  },
}

export default function VenuePageClient({ slug }: { slug: string }) {
  const [venue, setVenue] = useState<Venue | null | undefined>(undefined)

  useEffect(() => {
    fetchVenueBySlug(slug)
      .then((v) => {
        if (v) setVenue(v)
        else setVenue(DEFAULT_VENUES[slug] || null)
      })
      .catch(() => {
        setVenue(DEFAULT_VENUES[slug] || null)
      })
  }, [slug])

  if (venue === undefined) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#c9f13e] border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#50555c] mt-4">Loading venue...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
          <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h1 className="text-2xl font-medium text-black">Venue not found</h1>
          <p className="text-sm text-[#50555c] mt-1">This venue doesn&apos;t exist or has been removed.</p>
          <Link href="/venues" className="text-black font-medium underline text-sm mt-4 inline-block">
            Browse all venues
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen text-black font-['Geist']">
      <Header />
      <VenueDetailClient venue={venue} />
      <Footer />
    </div>
  )
}
