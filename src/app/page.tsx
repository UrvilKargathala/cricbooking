'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Check, Clock3, MapPin, ShieldCheck, Star, Zap } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { fetchAreas, fetchVenues, fetchTodaySlotCounts, type VenueSlotInfo } from '@/lib/supabase-queries'
import type { Area, Venue } from '@/types'

const SURAT_AREAS_FEATURED = [
  { name: 'Vesu', slug: 'vesu', image: '/figma/venue-surat-arena.png', count: '12 turfs' },
  { name: 'Varachha', slug: 'varachha', image: '/figma/venue-green-pitch.png', count: '8 turfs' },
  { name: 'Adajan', slug: 'adajan', image: '/figma/venue-surat-arena.png', count: '6 turfs' },
  { name: 'Katargam', slug: 'katargam', image: '/figma/venue-royal-box.png', count: '5 turfs' },
  { name: 'Pal', slug: 'pal', image: '/figma/venue-sunset-turf.png', count: '7 turfs' },
]

const INITIAL_MATCH_STATE = {
  runs: 52,
  wickets: 2,
  balls: 33, // 5.3 overs
  target: 75,
  totalBalls: 48, // 8.0 overs
  thisOver: ['1', '4', '0', '6', 'Wd', '2'],
}

// Default fallback venues for guaranteed high-fidelity render
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

export default function Home() {
  const router = useRouter()
  const [areas, setAreas] = useState<Area[]>([])
  const [venues, setVenues] = useState<Venue[]>(DEFAULT_VENUES)
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('tonight')
  const [slotCounts, setSlotCounts] = useState<Record<string, VenueSlotInfo>>({})

  useEffect(() => {
    Promise.all([
      fetchAreas().then((res) => {
        if (res && res.length) setAreas(res)
      }),
      fetchVenues().then((res) => {
        if (res && res.length) setVenues(res)
      }),
      fetchTodaySlotCounts().then(setSlotCounts),
    ]).catch(() => {
      // Fallback data already loaded
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedArea) params.set('area', selectedArea)
    if (selectedTime) params.set('time', selectedTime)
    router.push(`/venues${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const [matchScore, setMatchScore] = useState(INITIAL_MATCH_STATE)

  const handleScoreAction = (action: '1' | '4' | '6' | 'W' | 'reset') => {
    if (action === 'reset') {
      setMatchScore(INITIAL_MATCH_STATE)
      return
    }

    setMatchScore((prev) => {
      if (prev.runs >= prev.target || prev.wickets >= 10 || prev.balls >= prev.totalBalls) {
        return prev
      }

      const newBalls = prev.balls + 1
      let newRuns = prev.runs
      let newWickets = prev.wickets
      let ballLabel = action

      if (action === '1') {
        newRuns += 1
      } else if (action === '4') {
        newRuns += 4
      } else if (action === '6') {
        newRuns += 6
      } else if (action === 'W') {
        newWickets = Math.min(10, newWickets + 1)
        ballLabel = 'W'
      }

      const updatedOver = [...prev.thisOver, ballLabel].slice(-8)

      return {
        ...prev,
        runs: newRuns,
        wickets: newWickets,
        balls: newBalls,
        thisOver: updatedOver,
      }
    })
  }

  const currentOvers = `${Math.floor(matchScore.balls / 6)}.${matchScore.balls % 6}`
  const runsNeeded = Math.max(0, matchScore.target - matchScore.runs)
  const ballsLeft = Math.max(0, matchScore.totalBalls - matchScore.balls)
  const statusSubtitle =
    matchScore.runs >= matchScore.target
      ? `Won by ${10 - matchScore.wickets} wickets!`
      : matchScore.wickets >= 10 || matchScore.balls >= matchScore.totalBalls
      ? 'Innings finished'
      : `${currentOvers} overs · need ${runsNeeded} from ${ballsLeft}`

  const quickBookVenues = (venues.length ? venues : DEFAULT_VENUES).slice(0, 5)

  const featuredVenue = venues[0] || DEFAULT_VENUES[0]
  const otherVenues = venues.slice(1, 4).length ? venues.slice(1, 4) : DEFAULT_VENUES.slice(1, 4)
  const featuredPrices = (featuredVenue.courts ?? [])
    .map((court) => Number(court.price_per_slot))
    .filter((price) => Number.isFinite(price) && price > 0)
  const featuredPrice = featuredPrices.length ? Math.min(...featuredPrices) : 600
  const featuredRating = Number(featuredVenue.rating)
  const featuredRatingLabel = Number.isFinite(featuredRating) && featuredRating > 0 ? featuredRating.toFixed(1) : '4.6'

  return (
    <div className="bg-[#020B12] min-h-screen text-white font-['Geist']">
      <Header />

      {/* ========================================================
          1. HERO SECTION (FULL-SCREEN 100svh VIEWPORT + INTRO ANIMATION)
          ======================================================== */}
      <Hero
        areas={areas}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        handleSearch={handleSearch}
      />

      <main className="home-canvas flex flex-col bg-[#fbfcfa] text-black">
        {/* ========================================================
            2. MARQUEE BANNER
            ======================================================== */}
        <section className="px-3 sm:px-6 w-full max-w-[1440px] mx-auto py-2">
          <div className="bg-[#c9f13e] rounded-[16px] py-4 sm:py-5 overflow-hidden select-none">
            <div className="flex gap-8 items-center whitespace-nowrap animate-marquee">
              {[1, 2, 3].map((set) => (
                <div key={set} className="flex gap-8 items-center text-[22px] sm:text-[26px] font-medium tracking-tight text-black">
                  <span>Box cricket</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>Floodlit turfs</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>Instant booking</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>Live scores</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>No booking fee</span>
                  <span className="opacity-60 text-lg">✦</span>
                  <span>Surat venues</span>
                  <span className="opacity-60 text-lg">✦</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tonight's availability leads with the job players came to do. */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="section-kicker mb-3">Ready to book</p>
              <h2 className="text-[32px] sm:text-[46px] font-semibold tracking-[-0.04em] text-black leading-none">
                Available tonight
                <span className="text-[#64707a] font-normal"> in Surat</span>
              </h2>
              <p className="text-[15px] text-[#56616a] mt-3">Choose a real open slot and get confirmed in under a minute.</p>
            </div>
            <Link href="/venues?time=tonight" className="group w-fit text-[14px] font-semibold text-black inline-flex items-center gap-2 hover:text-[#405700] transition-colors">
              See all available slots <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickBookVenues.slice(0, 4).map((venue, index) => {
              const time = ['8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'][index]
              const price = venue.courts?.[0]?.price_per_slot || 600
              const distance = ['1.8 km away', '2.4 km away', '3.1 km away', '4.0 km away'][index]
              const openSlots = slotCounts[venue.id]?.available || [2, 3, 1, 2][index]
              return (
                <Link key={venue.id} href={`/venues/${venue.slug}#book-a-slot`} className="group relative overflow-hidden rounded-[20px] bg-white border border-[#e0e5e8] hover:border-[#042644]/35 hover:shadow-[0_16px_32px_rgb(4_38_68_/_0.12)] transition-all">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#dce4e7]">
                    <Image src={venue.cover_image || '/figma/venue-surat-arena.png'} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-[#c9f13e] px-2.5 py-1 text-[12px] font-bold text-black"><Clock3 className="size-3" />{time}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[17px] text-black tracking-tight line-clamp-1">{venue.name}</h3>
                        <p className="text-[13px] text-[#63707a] mt-1">{venue.area?.name || 'Surat'} · Floodlit box cricket</p>
                      </div>
                      <span className="text-[15px] font-bold text-black whitespace-nowrap">₹{price}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-y border-[#edf0f1] py-2 text-[12px] text-[#50616c]">
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3 text-[#6e9500]" />{distance}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-black"><Star className="size-3 fill-[#c9f13e] text-[#839d20]" />{Number(venue.rating || 4.6).toFixed(1)}</span>
                    </div>
                    <p className={`mt-3 text-[12px] font-semibold ${openSlots <= 1 ? 'text-[#d63b40]' : 'text-[#5b7800]'}`}>{openSlots <= 1 ? 'Last slot at this time' : `${openSlots} slots available tonight`}</p>
                    <div className="mt-4 w-full rounded-full bg-[#020b12] group-hover:bg-[#c9f13e] py-2.5 text-center text-[13px] font-bold text-white group-hover:text-black transition-colors">Book {time}</div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#697680]">Quick filters</span>
            {[
              ['Tonight', '/venues?time=tonight'], ['Under ₹700', '/venues?max_price=700'], ['Floodlights', '/venues?amenity=floodlights'], ['Open late', '/venues?timing=late'], ['Near me', '/venues?sort=nearby'],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="rounded-full border border-[#dce3e6] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#263640] hover:border-[#020b12] hover:bg-[#f3f8e7] transition-colors">{label}</Link>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[20px] border border-[#dfe6df] bg-[#f2f7ec] text-[#25331d]">
            <div className="col-span-2 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-[#d9e4ce] p-4 sm:p-5">
              <p className="text-[20px] font-bold tracking-tight">4.8/5</p>
              <p className="mt-0.5 text-[12px] text-[#617056]">Average player rating</p>
            </div>
            <div className="flex items-center gap-2 border-r border-[#d9e4ce] p-4 sm:p-5 text-[12px] font-semibold"><Zap className="size-4 text-[#6e9500]" />Instant confirmation</div>
            <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-r border-[#d9e4ce] p-4 sm:p-5 text-[12px] font-semibold"><ShieldCheck className="size-4 text-[#6e9500]" />Secure UPI payment</div>
            <div className="flex items-center gap-2 border-t lg:border-t-0 border-[#d9e4ce] p-4 sm:p-5 text-[12px] font-semibold"><Check className="size-4 text-[#6e9500]" />No booking fee</div>
          </div>
        </section>

        {/* ========================================================
            3. BRAND STATEMENT WITH INLINE PILLS
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#042644] px-6 py-10 sm:px-12 sm:py-14 text-center shadow-[0_22px_48px_rgb(4_38_68_/_0.18)]">
            <div className="absolute -left-20 -top-24 size-72 rounded-full bg-[#c9f13e]/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 size-80 rounded-full bg-[#c9f13e]/10 blur-3xl" />
            <div className="relative z-10">
              <p className="section-kicker justify-center mb-5 text-white/65">Made for match night</p>
              <h2 className="mx-auto max-w-[990px] text-[30px] sm:text-[44px] md:text-[52px] font-semibold leading-[1.12] tracking-[-0.045em] text-white">
                Cricket is more than{' '}
                <span className="inline-flex align-middle mx-1 h-8 sm:h-10 w-14 sm:w-[72px] rounded-full overflow-hidden border border-white/20 relative">
                  <Image src="/figma/pill-cricket-1.png" alt="" fill className="object-cover" />
                </span>{' '}
                a game. It’s your Sunday team,{' '}
                <span className="inline-flex align-middle mx-1 h-8 sm:h-10 w-14 sm:w-[72px] rounded-full overflow-hidden border border-white/20 relative">
                  <Image src="/figma/pill-cricket-2.png" alt="" fill className="object-cover" />
                </span>{' '}
                your office league, and every last-ball finish worth sharing.
              </h2>
              <div className="mt-7 flex flex-wrap justify-center gap-2.5 text-[12px] font-semibold text-white/80">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Your team, your turf</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">Every ball counts</span>
                <span className="rounded-full bg-[#c9f13e] px-3 py-1.5 text-[#042644]">Made in Surat</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. BROWSE BY TYPE (CATEGORIES)
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#061923] p-6 sm:p-10">
            <div className="pointer-events-none absolute -right-24 -top-20 size-80 rounded-full bg-[#c9f13e]/10 blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">
            <div>
              <p className="section-kicker mb-3 text-white/60">Find your game</p>
              <h2 className="text-[32px] sm:text-[42px] font-semibold tracking-[-0.04em] text-white">Built for every kind of match</h2>
            </div>
            <p className="max-w-[280px] text-[14px] leading-relaxed text-white/60">Choose what matters most, then see only the places that fit.</p>
          </div>
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Box cricket */}
            <Link
              href="/venues?type=box_cricket"
              className="category-card sport-category min-h-[205px] bg-white/5 border border-white/12 hover:border-[#c9f13e]/60 hover:bg-white/10 p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-[#c9f13e] flex items-center justify-center text-[#042644] group-hover:scale-105 transition-transform">
                <Image src="/figma/box-cricket-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-[#c9f13e]">01 / PLAY FAST</span><span className="mt-2 text-[16px] font-semibold text-white block">Box cricket</span><span className="text-[12px] text-white/55">Fast, social games</span></div>
            </Link>

            {/* Open turfs */}
            <Link
              href="/venues?type=open_turf"
              className="category-card sport-category min-h-[205px] bg-white/5 border border-white/12 hover:border-[#c9f13e]/60 hover:bg-white/10 p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#c9f13e] group-hover:scale-105 transition-transform">
                <Image src="/figma/open-turf-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-[#c9f13e]">02 / GO BIG</span><span className="mt-2 text-[16px] font-semibold text-white block">Open turfs</span><span className="text-[12px] text-white/55">Room for the squad</span></div>
            </Link>

            {/* Floodlit */}
            <Link
              href="/venues?amenity=floodlights"
              className="category-card sport-category min-h-[205px] bg-[#c9f13e] hover:bg-[#d3f75a] p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Image src="/figma/floodlit-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-black/55">03 / MATCH NIGHT</span><span className="mt-2 text-[16px] font-semibold text-black block">Floodlit</span><span className="text-[12px] text-black/65">Made for after dark</span></div>
            </Link>

            {/* Open late */}
            <Link
              href="/venues?timing=late"
              className="category-card sport-category min-h-[205px] bg-[#0b2f42] border border-[#1b4b60] hover:border-[#c9f13e]/60 p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#c9f13e] group-hover:scale-105 transition-transform">
                <Image src="/figma/open-late-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-[#c9f13e]">04 / STAY OUT</span><span className="mt-2 text-[16px] font-semibold text-white block">Open late</span><span className="text-[12px] text-white/55">Play past 10 PM</span></div>
            </Link>

            {/* Live scores */}
            <Link
              href="/#live-scores"
              className="category-card sport-category min-h-[205px] bg-[#102e40] border border-[#1b4b60] hover:border-[#c9f13e]/60 p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-[#c9f13e] flex items-center justify-center text-black group-hover:scale-105 transition-transform">
                <Image src="/figma/live-scores-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-[#c9f13e]">05 / FOLLOW LIVE</span><span className="mt-2 text-[16px] font-semibold text-white block">Live scores</span><span className="text-[12px] text-white/55">Follow every ball</span></div>
            </Link>

            {/* Offers */}
            <Link
              href="/venues?filter=offers"
              className="category-card sport-category min-h-[205px] bg-white/5 border border-white/12 hover:border-[#c9f13e]/60 hover:bg-white/10 p-5 rounded-[20px] flex flex-col justify-between gap-4 group"
            >
              <div className="category-icon size-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#c9f13e] group-hover:scale-105 transition-transform">
                <Image src="/figma/offers-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <div><span className="text-[11px] font-bold tracking-[0.14em] text-[#c9f13e]">06 / SAVE MORE</span><span className="mt-2 text-[16px] font-semibold text-white block">Offers</span><span className="text-[12px] text-white/55">Great games, less spend</span></div>
            </Link>
          </div>
          </div>
        </section>

        {/* ========================================================
            4B. EXPLORE BY AREA IN SURAT
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 pb-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
            <div><p className="section-kicker mb-3">Pick a side of the city</p><h3 className="text-[30px] sm:text-[40px] font-semibold tracking-[-0.04em] text-black">Your next turf is nearby.</h3><p className="mt-2 text-[14px] text-[#64707a]">Start with an area, then choose the time that works.</p></div>
            <Link
              href="/venues"
              className="group w-fit rounded-full border border-[#dce4e7] bg-white px-4 py-2 text-[14px] font-semibold text-[#263640] hover:border-[#042644] inline-flex items-center gap-2 transition-colors"
            >
              <span>See every area</span>
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="rounded-[28px] border border-[#e0e6e8] bg-white p-3 sm:p-4 shadow-[0_14px_34px_rgb(4_38_68_/_0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              <Link href={`/venues?area=${SURAT_AREAS_FEATURED[0].slug}`} className="group relative lg:col-span-5 min-h-[280px] sm:min-h-[340px] overflow-hidden rounded-[22px] bg-[#042644] p-5 sm:p-6 flex flex-col justify-between">
                <Image
                  src={SURAT_AREAS_FEATURED[0].image}
                  alt={SURAT_AREAS_FEATURED[0].name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#021019]/95 via-[#021019]/20 to-transparent" />
                <div className="relative z-10 flex items-start justify-between gap-3"><span className="rounded-full bg-[#c9f13e] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#042644]">Most booked tonight</span><span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[12px] font-semibold text-white">{SURAT_AREAS_FEATURED[0].count}</span></div>
                <div className="relative z-10"><p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#c9f13e]">Start here</p><div className="mt-2 flex items-end justify-between"><div><h4 className="text-[30px] font-semibold tracking-[-0.04em] text-white">{SURAT_AREAS_FEATURED[0].name}</h4><p className="mt-1 text-[13px] text-white/70">Popular evening slots and floodlit courts</p></div><span className="grid size-10 place-items-center rounded-full bg-white text-[#042644] transition-transform group-hover:translate-x-1"><ArrowUpRight className="size-4" /></span></div></div>
              </Link>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {SURAT_AREAS_FEATURED.slice(1).map((item, index) => (
                  <Link key={item.slug} href={`/venues?area=${item.slug}`} className="group relative min-h-[160px] overflow-hidden rounded-[20px] bg-[#dce4e7] p-4 flex flex-col justify-between">
                    <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20 group-hover:from-black/90 transition-colors" />
                    <div className="relative z-10 flex justify-between items-start"><span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">{item.count}</span><span className="grid size-7 place-items-center rounded-full bg-[#c9f13e] text-[#042644] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"><ArrowUpRight className="size-3.5" /></span></div>
                    <div className="relative z-10"><p className="text-[11px] font-bold tracking-[0.13em] text-[#c9f13e]">0{index + 2} / SURAT</p><h4 className="mt-1 text-[20px] font-semibold tracking-tight text-white">{item.name}</h4></div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#f3f7ef] px-4 py-3 text-[13px] text-[#4f6148]"><span className="inline-flex items-center gap-2"><MapPin className="size-4 text-[#6e9500]" />Five neighbourhoods. One easy booking flow.</span><Link href="/venues" className="font-semibold text-[#365000] hover:underline">Browse all Surat turfs →</Link></div>
          </div>
        </section>

        {/* ========================================================
            5. POPULAR IN SURAT
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 sm:py-14 my-6 w-full">
          <div className="rounded-[28px] sm:rounded-[36px] bg-[#071720] px-5 py-8 sm:px-10 sm:py-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="section-kicker mb-3 text-white/60">Book with confidence</p>
              <h2 className="text-[34px] sm:text-[48px] font-semibold tracking-[-0.04em] text-white">Popular in <span className="bg-[#c9f13e] px-3.5 py-0.5 rounded-[12px] text-[#042644]">Surat</span></h2>
              <p className="mt-3 text-[14px] text-white/60">The courts players return to, week after week.</p>
            </div>

            <Link
              href="/venues"
              className="group border border-white/20 hover:border-[#c9f13e] bg-white/10 pl-5 pr-2 py-2 rounded-full text-[15px] font-medium text-white inline-flex items-center gap-2.5 transition-colors"
            >
              <span>See all turfs</span>
              <span className="size-8 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-4" strokeWidth={2} />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between gap-4 group shadow-[0_18px_45px_rgb(0_0_0_/_0.20)]">
              <Link href={`/venues/${featuredVenue.slug}`} className="relative aspect-[16/11] sm:aspect-[16/9] rounded-[19px] overflow-hidden bg-[#dde3ea] block">
                <Image
                  src={featuredVenue.cover_image || '/figma/venue-green-pitch.png'}
                  alt={featuredVenue.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-[#c9f13e] px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.08em] text-[#042644] shadow-sm">
                  Player favourite · ★ {featuredRatingLabel}
                </div>
                <div className="absolute bottom-4 left-4 rounded-full bg-[#042644]/90 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md">
                  {featuredVenue.area?.name || 'Surat'} · Floodlit box cricket
                </div>
                <div className="absolute bottom-4 right-4 bg-white px-4 py-1.5 rounded-full text-[14px] font-bold text-[#042644] shadow-md">
                  From ₹{featuredPrice}/hr
                </div>
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 px-1">
                <div>
                  <Link href={`/venues/${featuredVenue.slug}`}>
                    <h3 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.035em] text-black group-hover:text-[#30510b]">
                      {featuredVenue.name}
                    </h3>
                  </Link>
                  <p className="text-[14px] text-[#50555c] mt-0.5">
                    {featuredVenue.opening_time ? featuredVenue.opening_time.slice(0, 5) : '6:00'} – {featuredVenue.closing_time ? featuredVenue.closing_time.slice(0, 5) : '23:00'} · instant confirmation · ₹0 booking fee
                  </p>
                </div>

                <Link
                  href={`/venues/${featuredVenue.slug}`}
                  className="bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-5 pr-2 py-2 rounded-full text-[15px] font-medium inline-flex items-center gap-2.5 w-fit"
                >
                  <span>Book this turf</span>
                  <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              {otherVenues.map((venue) => {
                const prices = (venue.courts ?? []).map((court) => Number(court.price_per_slot)).filter((price) => Number.isFinite(price) && price > 0)
                const price = prices.length ? Math.min(...prices) : 600
                const rating = Number(venue.rating)
                const ratingLabel = Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : '4.6'
                const courtCount = Math.max(venue.courts?.length ?? 0, 1)
                const image = venue.cover_image || (venue.slug?.includes('royal') ? '/figma/venue-royal-box.png' : venue.slug?.includes('sunset') ? '/figma/venue-sunset-turf.png' : '/figma/venue-surat-arena.png')
                return (
                  <Link key={venue.id} href={`/venues/${venue.slug}`} className="group grid grid-cols-[78px_1fr_auto] sm:grid-cols-[100px_1fr_auto] items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-2.5 sm:p-3 hover:border-[#c9f13e]/60 hover:bg-white/10 transition-all">
                    <div className="relative h-[76px] sm:h-[86px] overflow-hidden rounded-[13px] bg-[#123449]"><Image src={image} alt={venue.name} fill sizes="100px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                    <div className="min-w-0"><div className="flex items-center justify-between gap-2"><h3 className="truncate text-[15px] sm:text-[17px] font-semibold text-white">{venue.name}</h3><span className="hidden sm:inline rounded-full bg-[#c9f13e]/15 px-2 py-0.5 text-[11px] font-bold text-[#c9f13e]">★ {ratingLabel}</span></div><p className="mt-1 truncate text-[12px] text-white/55">{venue.area?.name || 'Surat'} · {courtCount} court{courtCount > 1 ? 's' : ''} · {slotCounts[venue.id]?.available || 2} slots tonight</p><p className="mt-2 text-[14px] font-bold text-[#c9f13e]">From ₹{price}/hr</p></div>
                    <span className="grid size-8 sm:size-9 place-items-center rounded-full border border-white/15 text-[#c9f13e] transition-all group-hover:bg-[#c9f13e] group-hover:text-[#042644]"><ArrowUpRight className="size-3.5" /></span>
                  </Link>
                )
              })}

              {/* Browse on the map card */}
              <Link
                href="/venues?view=map"
                className="bg-[#c9f13e] hover:bg-[#d6fa5b] rounded-[18px] p-4 flex items-center justify-between group transition-all min-h-[82px]"
              >
                <div className="size-10 rounded-full bg-[#042644] flex items-center justify-center text-[#c9f13e] group-hover:scale-105 transition-transform order-2">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h4 className="text-[17px] font-semibold text-[#042644] tracking-tight">
                    Browse on the map
                  </h4>
                  <p className="text-[12px] text-[#042644]/70 mt-1">
                    Find a court close to your team
                  </p>
                </div>
              </Link>
            </div>
          </div>
          </div>
        </section>

        {/* ========================================================
            6. LIVE SCORING SECTION (INTERACTIVE SHOWCASE)
            ======================================================== */}
        <section id="live-scores" className="max-w-[1240px] mx-auto px-4 sm:px-6 py-14 sm:py-20 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"><div><p className="section-kicker mb-3">More than a booking</p><h2 className="text-[34px] sm:text-[46px] font-semibold tracking-[-0.04em] text-black">Keep the whole team in the game.</h2></div><p className="max-w-[290px] text-[14px] leading-relaxed text-[#64707a]">A live scoreboard is ready for every match, so friends can follow from anywhere.</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Live Score Card (Dark Navy/Black) */}
            <div className="lg:col-span-8 relative overflow-hidden bg-[#06141d] border border-[#123144] rounded-[20px] p-6 sm:p-9 text-white flex flex-col justify-between gap-6 shadow-[0_18px_45px_rgba(2,11,18,0.22)]">
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#c9f13e]/[0.07] blur-3xl pointer-events-none" />
              {/* Header */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="bg-[#e5484d] text-white text-[13px] font-medium px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                  <span>LIVE · Surat Cricket Arena, Court 2</span>
                </div>

                <Link
                  href="/venues/surat-cricket-arena"
                  className="text-[#c9f13e] hover:underline text-[15px] font-medium inline-flex items-center gap-1.5"
                >
                  <span>Watch live</span>
                  <ArrowUpRight className="size-4" strokeWidth={2} />
                </Link>
              </div>

              {/* Two Inning Teams */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Team 1 */}
                <div className="bg-white/10 rounded-[16px] p-5 flex flex-col gap-2">
                  <span className="text-[14px] text-white/70">Pal Panthers</span>
                  <span className="text-[42px] sm:text-[48px] font-medium tracking-tight text-white leading-none">
                    74/4
                  </span>
                  <span className="text-[13px] text-white/70">8.0 overs · innings done</span>
                </div>

                {/* Team 2 */}
                <div className="bg-[#c9f13e] text-black rounded-[16px] p-5 flex flex-col gap-2">
                  <span className="text-[14px] text-black/80 font-medium">Adajan Strikers · batting</span>
                  <span className="text-[42px] sm:text-[48px] font-medium tracking-tight text-black leading-none">
                    {matchScore.runs}/{matchScore.wickets}
                  </span>
                  <span className="text-[13px] text-black/80 font-medium">{statusSubtitle}</span>
                </div>
              </div>

              {/* This Over Pill Tracker & Interactive Controls */}
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
                <div className="relative overflow-hidden flex-1">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pr-8">
                    <span className="text-[13px] text-white/70 whitespace-nowrap mr-1 shrink-0">This over</span>
                    {matchScore.thisOver.map((b, idx) => {
                      let bgClass = 'bg-white/15 text-white'
                      if (b === '4') bgClass = 'bg-[#c9f13e] text-black'
                      else if (b === '6') bgClass = 'bg-black border border-[#c9f13e] text-[#c9f13e]'
                      else if (b === 'W') bgClass = 'bg-[#e5484d] text-white'
                      else if (b === 'Wd') bgClass = 'bg-[#e3ebfa] text-[#042644]'
                      return (
                        <span
                          key={idx}
                          className={`size-8 sm:size-9 rounded-full font-semibold text-xs flex items-center justify-center shrink-0 ${bgClass}`}
                        >
                          {b}
                        </span>
                      )
                    })}
                  </div>
                  {/* Subtle right-edge scroll fade */}
                  <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-black to-transparent" />
                </div>

                {/* Score Action Pills */}
                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                  <span className="text-[11px] text-white/50 mr-1 hidden md:inline">Try scoring:</span>
                  <button
                    type="button"
                    onClick={() => handleScoreAction('1')}
                    className="size-8 sm:size-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[12px] font-semibold flex items-center justify-center transition-all"
                    title="Add 1 Run"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreAction('4')}
                    className="size-8 sm:size-9 rounded-full bg-[#c9f13e]/20 hover:bg-[#c9f13e] text-[#c9f13e] hover:text-black active:scale-95 text-[12px] font-bold flex items-center justify-center transition-all"
                    title="Add 4 Runs"
                  >
                    4
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreAction('6')}
                    className="size-8 sm:size-9 rounded-full bg-[#c9f13e] text-black hover:bg-[#b8e12d] active:scale-95 text-[12px] font-bold flex items-center justify-center transition-all"
                    title="Add 6 Runs"
                  >
                    6
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreAction('W')}
                    className="size-8 sm:size-9 rounded-full bg-[#e5484d] hover:bg-[#d63b40] text-white active:scale-95 text-[12px] font-bold flex items-center justify-center transition-all"
                    title="Out (Wicket)"
                  >
                    W
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreAction('reset')}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 hover:text-white text-[11px] font-medium transition-all ml-1"
                    title="Reset Score"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Score Your Own Match Free Card */}
            <div className="lg:col-span-4 relative overflow-hidden bg-[#eaf3d9] border border-[#d8e8bc] rounded-[20px] p-6 sm:p-9 flex flex-col justify-between gap-6 group hover:shadow-md transition-all">
              <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#c9f13e]/40 blur-3xl" />
              <div className="relative size-12 rounded-full bg-[#042644] flex items-center justify-center text-[#c9f13e]">
                <Image src="/figma/box-cricket-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>

              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#527000]">Included with every booking</p>
                <h3 className="mt-3 text-[26px] sm:text-[28px] font-semibold tracking-tight text-[#042644] leading-tight">
                  Score your own match, free
                </h3>
                <p className="text-[15px] text-[#40513a] mt-3 leading-relaxed">
                  Every booking comes with a live scoreboard your friends can follow anywhere.
                </p>
              </div>

              <Link
                href="/venues"
                className="relative group/cta bg-[#042644] hover:bg-[#0a3c57] transition-colors text-white pl-5 pr-2 py-2.5 rounded-full text-[15px] font-semibold inline-flex items-center justify-between w-full"
              >
                <span>Start scoring</span>
                <span className="size-8 rounded-full bg-[#c9f13e] text-[#042644] flex items-center justify-center transition-transform group-hover/cta:translate-x-0.5">
                  <ArrowUpRight className="size-4" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            7. THREE TAPS TO THE PITCH (HOW IT WORKS)
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-14 sm:py-20 w-full">
          <div className="max-w-[620px] mb-9"><p className="section-kicker mb-3">Simple from search to wicket</p><h2 className="text-[34px] sm:text-[48px] font-semibold tracking-[-0.04em] text-black">Three taps. One confirmed game.</h2><p className="mt-3 text-[15px] text-[#64707a]">No calls, no waiting, no surprise fees. Just choose your court and show up.</p></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="process-card bg-white border border-[#e3e5e8] rounded-[20px] p-7 flex flex-col justify-between min-h-[250px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#042644] leading-none">
                01
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-black tracking-tight">Pick a turf</h3>
                <span className="inline-block mt-2 rounded-full bg-[#eff5e7] px-2.5 py-1 text-[11px] font-bold text-[#527000]">Area · time · price</span>
                <p className="text-[14px] text-[#50555c] mt-1.5 leading-relaxed">
                  Filter by area, price and time. Every slot shown is really free.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="process-card bg-[#eef1f4] rounded-[20px] p-7 flex flex-col justify-between min-h-[250px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#042644] leading-none">
                02
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-black tracking-tight">Choose your hour</h3>
                <span className="inline-block mt-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#40515d]">Real-time availability</span>
                <p className="text-[14px] text-[#50555c] mt-1.5 leading-relaxed">
                  Tap a slot, add players and see the total upfront. No surprises.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="process-card bg-[#042644] rounded-[20px] p-7 flex flex-col justify-between min-h-[250px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#c9f13e] leading-none">
                03
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-white tracking-tight">Pay and play</h3>
                <span className="inline-block mt-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-[#c9f13e]">Ticket sent instantly</span>
                <p className="text-[14px] text-white/65 mt-1.5 leading-relaxed">
                  Pay with UPI or card. Your ticket and scoreboard are ready instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            8. CRICBOOKING IN NUMBERS
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className="section-kicker mb-3">Trusted on match day</p><h2 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.04em] text-black">Built around real players.</h2></div><p className="hidden sm:block max-w-[240px] text-[13px] leading-relaxed text-[#64707a]">More cricket, fewer calls, and no surprises at checkout.</p></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[24px] border border-[#163545] bg-[#071720]">
            <div className="bg-[#c9f13e] text-black p-6 sm:p-7 flex flex-col justify-between min-h-[140px]">
              <span className="text-[44px] sm:text-[52px] font-medium tracking-tight leading-none">
                500+
              </span>
              <span className="text-[15px] sm:text-[16px] font-normal text-black">
                players this month
              </span>
            </div>

            <div className="text-white p-6 sm:p-7 flex flex-col justify-between min-h-[140px] border-l border-[#163545]">
              <span className="text-[44px] sm:text-[52px] font-medium tracking-tight text-[#c9f13e] leading-none">
                4
              </span>
              <span className="text-[15px] sm:text-[16px] font-normal text-white/70">
                venues live in Surat
              </span>
            </div>

            <div className="text-white p-6 sm:p-7 flex flex-col justify-between min-h-[140px] border-t lg:border-t-0 border-l border-[#163545]">
              <span className="text-[44px] sm:text-[52px] font-medium tracking-tight text-[#c9f13e] leading-none">
                ₹0
              </span>
              <span className="text-[15px] sm:text-[16px] font-normal text-white/70">
                booking fee, ever
              </span>
            </div>

            <div className="text-white p-6 sm:p-7 flex flex-col justify-between min-h-[140px] border-t lg:border-t-0 border-l border-[#163545]">
              <span className="text-[44px] sm:text-[52px] font-medium tracking-tight text-[#c9f13e] leading-none">
                24/7
              </span>
              <span className="text-[15px] sm:text-[16px] font-normal text-white">
                player support
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================
            9. PLAYERS LOVE IT (TESTIMONIALS)
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-14 sm:py-20 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8"><div><p className="section-kicker mb-3">From the crease</p><h2 className="text-[34px] sm:text-[48px] font-semibold tracking-[-0.04em] text-black">The group chat approves.</h2></div><p className="text-[14px] text-[#64707a]">Rated by players who book, play, and score here.</p></div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Testimonial 1 */}
            <div className="md:col-span-5 bg-[#042644] rounded-[20px] p-8 flex flex-col justify-between gap-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-4 fill-[#c9f13e] text-[#c9f13e]" />
                ))}
              </div>

              <blockquote className="text-[20px] sm:text-[22px] font-medium tracking-tight text-white leading-snug">
                “Booked Green Pitch at 7, playing by 8. The slot was exactly as shown.”
              </blockquote>

              <div className="flex items-center gap-3">
                <span className="size-10 rounded-full bg-[#c9f13e] text-black font-semibold text-sm flex items-center justify-center border-2 border-white">
                  UK
                </span>
                <div>
                  <p className="text-[15px] font-medium text-white">Urvil Kargathala</p>
                  <p className="text-[13px] text-white/60">Varachha</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="md:col-span-4 bg-white border border-[#e3e5e8] rounded-[20px] p-8 flex flex-col justify-between gap-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-4 fill-black text-black" />
                ))}
              </div>

              <blockquote className="text-[18px] sm:text-[20px] font-normal tracking-tight text-black leading-snug">
                “The live scoreboard is insane. Our whole college group was watching the final over live.”
              </blockquote>

              <div className="flex items-center gap-3">
                <span className="size-10 rounded-full bg-[#e3ebfa] text-[#042644] font-semibold text-sm flex items-center justify-center border-2 border-white">
                  TD
                </span>
                <div>
                  <p className="text-[15px] font-medium text-black">Tirth Dave</p>
                  <p className="text-[13px] text-[#50555c]">Vesu</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="md:col-span-3 bg-[#eef1f4] rounded-[20px] p-8 flex flex-col justify-between gap-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-4 fill-black text-black" />
                ))}
              </div>

              <blockquote className="text-[18px] font-normal tracking-tight text-black leading-snug">
                “No calls needed. Clean UPI payment, got booking code instantly.”
              </blockquote>

              <div className="flex items-center gap-3">
                <span className="size-10 rounded-full bg-[#042644] text-white font-semibold text-sm flex items-center justify-center border-2 border-white">
                  DT
                </span>
                <div>
                  <p className="text-[15px] font-medium text-black">Dhruv Talati</p>
                  <p className="text-[13px] text-[#50555c]">Adajan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            10. FOR TURF OWNERS SECTION
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 pb-12 w-full">
          <div className="owner-panel bg-[#042644] rounded-[28px] sm:rounded-[36px] overflow-hidden p-8 sm:p-12 md:p-14 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-[#c9f13e] text-black px-3.5 py-1.5 rounded-full text-[13px] font-medium w-fit">
                For turf owners
              </div>

              <h2 className="text-[32px] sm:text-[46px] md:text-[52px] font-normal tracking-[-0.035em] leading-[1.1] text-white">
                Fill your empty daytime and weekday slots.
              </h2>

              <p className="text-[16px] sm:text-[18px] text-white/75 max-w-[560px] leading-relaxed">
                List free, take online payments and let players score matches on your courts with automatic revenue settlement.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/list-venue"
                  className="group bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-6 pr-2 py-2.5 rounded-full text-[15px] font-medium inline-flex items-center gap-3"
                >
                  <span>List your venue free</span>
                  <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </Link>

                <Link
                  href="/contact"
                  className="border border-white/30 hover:border-white px-6 py-3 rounded-full text-[15px] font-medium text-white transition-colors"
                >
                  Contact sales
                </Link>
              </div>
            </div>

            {/* Right Column: Image with +38% bookings badge */}
            <div className="lg:col-span-4 relative aspect-[4/3] rounded-[24px] overflow-hidden bg-[#dde3ea]">
              <Image
                src="/figma/owner-banner.png"
                alt="Turf Owner Dashboard"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-white text-black px-4 py-1.5 rounded-full text-[13px] font-medium shadow-lg">
                +38% bookings
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
