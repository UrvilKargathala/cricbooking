'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Clock3, MapPin, Search, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VenueCard } from '@/components/venue/VenueCard'
import { fetchAreas, fetchVenues, fetchTodaySlotCounts, type VenueSlotInfo } from '@/lib/supabase-queries'
import type { Area, Venue } from '@/types'

const DEFAULT_VENUES: Venue[] = [
  {
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
    images: ['/figma/venue-green-pitch.png'],
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
  {
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
    images: ['/figma/venue-surat-arena.png'],
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
  {
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
  {
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
]

export default function VenuesPage() {
  return (
    <Suspense fallback={null}>
      <VenuesPageContent />
    </Suspense>
  )
}

function VenuesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedArea, setSelectedArea] = useState<string | null>(searchParams.get('area'))
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [areas, setAreas] = useState<Area[]>([])
  const [allVenues, setAllVenues] = useState<Venue[]>(DEFAULT_VENUES)
  const [slotCounts, setSlotCounts] = useState<Record<string, VenueSlotInfo>>({})

  useEffect(() => {
    Promise.all([
      fetchAreas().then((res) => {
        if (res?.length) setAreas(res)
      }),
      fetchVenues().then((res) => {
        if (res?.length) setAllVenues(res)
      }),
      fetchTodaySlotCounts().then(setSlotCounts),
    ]).catch(() => {})
  }, [])

  useEffect(() => {
    setSelectedArea(searchParams.get('area'))
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const filteredVenues = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allVenues.filter((v) => {
      const matchArea = !selectedArea || v.area?.slug === selectedArea
      const matchQuery =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.area?.name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
      return matchArea && matchQuery
    })
  }, [allVenues, selectedArea, query])

  const popularAreas = useMemo(() => {
    if (areas.length > 0) {
      return [{ name: 'All', slug: null }, ...areas.map((a) => ({ name: a.name, slug: a.slug }))]
    }
    return [
      { name: 'All', slug: null },
      { name: 'Vesu', slug: 'vesu' },
      { name: 'Adajan', slug: 'adajan' },
      { name: 'Varachha', slug: 'varachha' },
      { name: 'Katargam', slug: 'katargam' },
      { name: 'Pal', slug: 'pal' },
    ]
  }, [areas])

  const handleAreaClick = (slug: string | null) => {
    setSelectedArea(slug)
    const params = new URLSearchParams()
    if (slug) params.set('area', slug)
    if (query) params.set('q', query)
    router.push(`/venues${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="bg-[#f7f9f7] min-h-screen text-black font-['Geist'] flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        <section className="bg-[#061923] pt-4 pb-10 sm:pt-7 sm:pb-14">
          <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[26px] sm:rounded-[32px] border border-white/10 bg-[#0a2939] px-5 py-8 sm:px-10 sm:py-11">
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#c9f13e]/10 blur-3xl" />
              <div className="relative max-w-[790px]"><p className="section-kicker mb-4 text-white/60">Surat’s cricket courts</p><h1 className="text-[38px] sm:text-[56px] font-semibold tracking-[-0.05em] leading-none text-white">Your game starts <span className="text-[#c9f13e]">here.</span></h1><p className="mt-4 text-[15px] sm:text-[17px] text-white/65">Find live availability, book in seconds, and get the whole squad on the turf.</p></div>
              <div className="relative mt-7 flex flex-col sm:flex-row gap-2 rounded-[20px] sm:rounded-full bg-white p-2 sm:pl-5 shadow-[0_15px_40px_rgb(0_0_0_/_0.25)]">
                <Search className="mt-2 sm:mt-0 sm:self-center size-5 text-[#63707a] shrink-0" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search venue, area or amenity" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[15px] text-black placeholder:text-[#7b858c] focus:outline-none" />
                {query && <button onClick={() => setQuery('')} className="rounded-full px-3 text-xs font-semibold text-[#63707a] hover:text-black">Clear</button>}
                <button type="button" onClick={() => handleAreaClick(selectedArea)} className="rounded-full bg-[#c9f13e] px-5 py-3 text-[14px] font-bold text-[#042644] hover:bg-[#d6fa5b]">Search turfs</button>
              </div>
              <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-white/65"><span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-[#c9f13e]" />Instant confirmation</span><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-[#c9f13e]" />Live slots for tonight</span><span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-[#c9f13e]" />Across Surat</span></div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-9 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5"><div><p className="section-kicker mb-3">Available to book</p><h2 className="text-[28px] sm:text-[38px] font-semibold tracking-[-0.04em]">{filteredVenues.length} turf{filteredVenues.length === 1 ? '' : 's'} in Surat</h2></div><p className="text-[14px] text-[#63707a]">Every slot shown is free to book.</p></div>

        {/* Area Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-7 px-1 scrollbar-hide snap-x snap-mandatory">
          {popularAreas.map((area) => {
            const isActive = selectedArea === area.slug || (!selectedArea && area.slug === null)
            return (
              <button
                key={area.name}
                onClick={() => handleAreaClick(area.slug)}
                className={`snap-start px-4 py-2 rounded-full text-[14px] font-medium transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-[#042644] text-[#c9f13e] shadow-[0_5px_14px_rgb(4_38_68_/_0.16)]'
                    : 'bg-white border border-[#e0e6e8] text-[#35444d] hover:border-[#042644]/40 hover:bg-[#f3f8e9]'
                }`}
              >
                {area.name}
              </button>
            )
          })}
        </div>

        {/* Venue Grid */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVenues.map((v) => (
              <VenueCard key={v.id} venue={v} slotInfo={slotCounts[v.id]} featured={v.is_featured} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#f4f6f8] rounded-[24px] p-8 flex flex-col items-center justify-center">
            <p className="text-[20px] font-medium text-black">No turfs found</p>
            <p className="text-[14px] text-[#50555c] mt-1 max-w-sm">
              We couldn’t find any turfs matching your filter. Try clearing your search or selecting &quot;All&quot;.
            </p>
            <button
              onClick={() => {
                setQuery('')
                setSelectedArea(null)
                router.push('/venues')
              }}
              className="mt-5 bg-black text-white px-5 py-2.5 rounded-full text-[14px] font-medium"
            >
              Reset filters
            </button>
          </div>
        )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
