'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ChevronDown, MapPin, Star } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VenueCard } from '@/components/venue/VenueCard'
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

  return (
    <div className="bg-white min-h-screen text-black font-['Geist']">
      <Header />

      <main className="flex flex-col">
        {/* ========================================================
            1. HERO SECTION
            ======================================================== */}
        <section className="px-3 sm:px-6 pt-6 sm:pt-9 pb-6 w-full max-w-[1440px] mx-auto">
          <div className="relative min-h-[640px] md:min-h-[740px] rounded-[32px] sm:rounded-[40px] overflow-hidden bg-[#dde3ea] flex flex-col justify-between p-6 sm:p-12 md:p-16">
            {/* Background image & overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/figma/hero-bg.png"
                alt="Cricket Turf in Surat"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(4,38,68,0.3)] to-[rgba(4,38,68,0.75)]" />
            </div>

            {/* Top Avatars Pill */}
            <div className="relative z-10">
              <div className="backdrop-blur-md bg-white/15 border border-white/25 rounded-full p-1 pl-1 pr-4 inline-flex items-center gap-3 shadow-lg">
                <div className="flex -space-x-2">
                  <span className="size-8 sm:size-9 rounded-full bg-[#c9f13e] text-black font-semibold text-xs flex items-center justify-center border-2 border-white">
                    UK
                  </span>
                  <span className="size-8 sm:size-9 rounded-full bg-[#e3ebfa] text-[#042644] font-semibold text-xs flex items-center justify-center border-2 border-white">
                    TD
                  </span>
                  <span className="size-8 sm:size-9 rounded-full bg-[#042644] text-white font-semibold text-xs flex items-center justify-center border-2 border-white">
                    DT
                  </span>
                </div>
                <span className="text-[13px] sm:text-[14px] text-white font-normal">
                  Play more. Book faster. Join 500+ players in Surat.
                </span>
              </div>
            </div>

            {/* Center Content / Headline */}
            <div className="relative z-10 flex flex-col gap-4 mt-auto mb-8 sm:mb-12 max-w-[980px]">
              <h1 className="text-[44px] sm:text-[70px] md:text-[84px] lg:text-[92px] font-normal leading-[1.05] tracking-[-0.035em] text-white">
                Book a turf. Play tonight.{' '}
                <span className="block sm:inline">
                  Score{' '}
                  <span className="inline-block bg-[#c9f13e] text-black px-4 sm:px-6 py-0.5 sm:py-1 rounded-[12px] sm:rounded-[14px] font-normal">
                    every ball.
                  </span>
                </span>
              </h1>

              <p className="text-[17px] sm:text-[19px] text-white/85 max-w-[540px] leading-relaxed">
                Real slots at real turfs across Surat. Pick a time, pay once, walk on.
              </p>
            </div>

            {/* Bottom Controls: Floating Search Bar & Live Matches Pill */}
            <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
              {/* Search Bar Pill */}
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-[28px] sm:rounded-full p-3 sm:p-1.5 pl-4 sm:pl-6 pr-4 sm:pr-1.5 shadow-[0_20px_35px_rgba(4,38,68,0.25)] flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full max-w-[620px]"
              >
                {/* Where */}
                <div className="flex-1 w-full sm:w-auto px-2 py-1">
                  <label className="block text-[11px] font-medium text-[#6c6c6c]">Where</label>
                  <div className="relative flex items-center">
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full bg-transparent text-[15px] font-medium text-[#1a1a1a] focus:outline-none cursor-pointer appearance-none pr-7"
                    >
                      <option value="">Area or venue</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.slug}>
                          {a.name}
                        </option>
                      ))}
                      {!areas.length && (
                        <>
                          <option value="vesu">Vesu</option>
                          <option value="varachha">Varachha</option>
                          <option value="adajan">Adajan</option>
                          <option value="katargam">Katargam</option>
                          <option value="pal">Pal</option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="size-4 text-[#6c6c6c] absolute right-1 pointer-events-none" />
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-[#e3e5e8]" />

                {/* When */}
                <div className="flex-1 w-full sm:w-auto px-2 py-1">
                  <label className="block text-[11px] font-medium text-[#6c6c6c]">When</label>
                  <div className="relative flex items-center">
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-transparent text-[15px] font-medium text-[#1a1a1a] focus:outline-none cursor-pointer appearance-none pr-7"
                    >
                      <option value="tonight">Tonight, 8 PM</option>
                      <option value="tomorrow">Tomorrow night</option>
                      <option value="weekend">This Weekend</option>
                      <option value="morning">Morning (6 - 10 AM)</option>
                    </select>
                    <ChevronDown className="size-4 text-[#6c6c6c] absolute right-1 pointer-events-none" />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="group bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-5 pr-2 py-2.5 rounded-full text-[15px] font-medium flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto active:scale-95 shrink-0"
                >
                  <span>Find turfs</span>
                  <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </button>
              </form>

              {/* LIVE Matches Pill */}
              <Link
                href="/#live-scores"
                className="backdrop-blur-md bg-white/15 border border-white/25 hover:bg-white/20 transition-colors rounded-[20px] px-4 py-3 flex items-center gap-3.5 w-fit shadow-lg"
              >
                <div className="bg-[#e5484d] text-white text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  <span>LIVE</span>
                </div>
                <div>
                  <p className="text-[20px] sm:text-[22px] font-medium text-white leading-tight tracking-tight">
                    3 matches
                  </p>
                  <p className="text-[12px] text-white/85">being scored right now</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

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

        {/* ========================================================
            3. BRAND STATEMENT WITH INLINE PILLS
            ======================================================== */}
        <section className="max-w-[1020px] mx-auto px-4 py-16 sm:py-24 text-center">
          <h2 className="text-[32px] sm:text-[46px] md:text-[50px] font-normal leading-[1.2] tracking-[-0.035em] text-black">
            We believe cricket is more than{' '}
            <span className="inline-flex align-middle mx-1.5 h-9 sm:h-11 w-16 sm:w-20 rounded-full overflow-hidden border-2 border-black/10 relative">
              <Image src="/figma/pill-cricket-1.png" alt="" fill className="object-cover" />
            </span>{' '}
            a game. It’s your Sunday team,{' '}
            <span className="inline-flex align-middle mx-1.5 h-9 sm:h-11 w-16 sm:w-20 rounded-full overflow-hidden border-2 border-black/10 relative">
              <Image src="/figma/pill-cricket-2.png" alt="" fill className="object-cover" />
            </span>{' '}
            your office league, and every last-ball finish worth sharing.
          </h2>
        </section>

        {/* ========================================================
            4. BROWSE BY TYPE (CATEGORIES)
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Box cricket */}
            <Link
              href="/venues?type=box_cricket"
              className="bg-white border border-[#e3e5e8] hover:border-black transition-all p-5 rounded-[16px] flex flex-col justify-between gap-4 group hover:shadow-sm"
            >
              <div className="size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Image src="/figma/box-cricket-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <span className="text-[16px] font-normal text-black">Box cricket</span>
            </Link>

            {/* Open turfs */}
            <Link
              href="/venues?type=open_turf"
              className="bg-[#eef1f4] hover:bg-[#e4e8ec] transition-all p-5 rounded-[16px] flex flex-col justify-between gap-4 group"
            >
              <div className="size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Image src="/figma/open-turf-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <span className="text-[16px] font-normal text-black">Open turfs</span>
            </Link>

            {/* Floodlit */}
            <Link
              href="/venues?amenity=floodlights"
              className="bg-[#c9f13e] hover:bg-[#b8e12d] transition-all p-5 rounded-[16px] flex flex-col justify-between gap-4 group"
            >
              <div className="size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Image src="/figma/floodlit-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <span className="text-[16px] font-normal text-black">Floodlit</span>
            </Link>

            {/* Open late */}
            <Link
              href="/venues?timing=late"
              className="bg-[#e3ebfa] hover:bg-[#d5e2f7] transition-all p-5 rounded-[16px] flex flex-col justify-between gap-4 group"
            >
              <div className="size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Image src="/figma/open-late-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <span className="text-[16px] font-normal text-black">Open late</span>
            </Link>

            {/* Live scores */}
            <Link
              href="/#live-scores"
              className="bg-white border border-[#e3e5e8] hover:border-black transition-all p-5 rounded-[16px] flex flex-col justify-between gap-4 group hover:shadow-sm"
            >
              <div className="size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Image src="/figma/live-scores-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <span className="text-[16px] font-normal text-black">Live scores</span>
            </Link>

            {/* Offers */}
            <Link
              href="/venues?filter=offers"
              className="bg-[#eef1f4] hover:bg-[#e4e8ec] transition-all p-5 rounded-[16px] flex flex-col justify-between gap-4 group"
            >
              <div className="size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Image src="/figma/offers-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>
              <span className="text-[16px] font-normal text-black">Offers</span>
            </Link>
          </div>
        </section>

        {/* ========================================================
            4A. PLAYING TONIGHT QUICK-BOOK STRIP
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 pb-2 w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#e5484d] animate-pulse" />
              <h3 className="text-[13px] font-semibold text-[#6c6c6c] uppercase tracking-wider">
                Playing tonight in Surat
              </h3>
            </div>
            <span className="text-[12px] text-[#6c6c6c] hidden sm:inline">Instant confirm slots</span>
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-hide pr-10">
              {quickBookVenues.map((v, i) => {
                const time = ['8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'][i % 5]
                const price = v.courts?.[0]?.price_per_slot || 600
                return (
                  <Link
                    key={v.id || i}
                    href={`/venues/${v.slug}#book-a-slot`}
                    className="group bg-[#f4f6f8] hover:bg-white border border-[#e3e5e8] hover:border-black rounded-full pl-4 pr-1.5 py-1.5 inline-flex items-center gap-3 transition-colors shrink-0 shadow-sm hover:shadow"
                  >
                    <span className="text-[14px] font-medium text-black">
                      <span className="font-semibold">{time}</span> · {v.name} · <span className="text-[#50555c]">₹{price}</span>
                    </span>
                    <span className="size-7 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                      <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-white to-transparent" />
          </div>
        </section>

        {/* ========================================================
            4B. EXPLORE BY AREA IN SURAT
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-8 pb-2 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[20px] sm:text-[24px] font-medium tracking-tight text-black">
              Explore by area in Surat
            </h3>
            <Link
              href="/venues"
              className="text-[14px] font-medium text-[#6c6c6c] hover:text-black inline-flex items-center gap-1 transition-colors"
            >
              <span>All areas</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {SURAT_AREAS_FEATURED.map((item) => (
              <Link
                key={item.slug}
                href={`/venues?area=${item.slug}`}
                className="group relative rounded-[20px] overflow-hidden bg-[#dde3ea] aspect-[16/11] sm:aspect-[4/3] flex flex-col justify-between p-3.5 border border-[#e3e5e8] hover:border-black transition-all"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 group-hover:from-black/85 transition-colors" />
                <div className="relative z-10 flex justify-end">
                  <span className="bg-[#c9f13e] text-black text-[11px] sm:text-[12px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                    {item.count}
                  </span>
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-white text-[16px] sm:text-[18px] font-medium tracking-tight">
                    {item.name}
                  </span>
                  <span className="size-6 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================
            5. POPULAR IN SURAT
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[34px] sm:text-[48px] font-normal tracking-[-0.035em] text-black">
              Popular in{' '}
              <span className="bg-[#c9f13e] px-3.5 py-0.5 rounded-[12px] font-normal">
                Surat
              </span>
            </h2>

            <Link
              href="/venues"
              className="group border border-[#e3e5e8] hover:border-black bg-white pl-5 pr-2 py-2 rounded-full text-[15px] font-medium text-black inline-flex items-center gap-2.5 transition-colors"
            >
              <span>See all turfs</span>
              <span className="size-8 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-4" strokeWidth={2} />
              </span>
            </Link>
          </div>

          {/* Grid: 1 Big Featured Venue Card + 3 Regular Cards + 1 Map Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Featured Large Card */}
            <div className="lg:col-span-6 bg-[#f4f6f8] rounded-[20px] p-3.5 flex flex-col justify-between gap-4 group">
              <Link href={`/venues/${featuredVenue.slug}`} className="relative aspect-[16/11] sm:aspect-[16/10] rounded-[16px] overflow-hidden bg-[#dde3ea] block">
                <Image
                  src={featuredVenue.cover_image || '/figma/venue-green-pitch.png'}
                  alt={featuredVenue.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-[#c9f13e] px-3.5 py-1.5 rounded-full text-[13px] font-medium text-black shadow-sm">
                  Featured · ★ 4.7
                </div>
                <div className="absolute bottom-4 right-4 bg-white px-4 py-1.5 rounded-full text-[14px] font-medium text-black shadow-md">
                  From ₹700/hr
                </div>
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 px-1">
                <div>
                  <Link href={`/venues/${featuredVenue.slug}`}>
                    <h3 className="text-[24px] sm:text-[28px] font-medium tracking-tight text-black group-hover:text-neutral-700">
                      {featuredVenue.name}
                    </h3>
                  </Link>
                  <p className="text-[14px] text-[#50555c] mt-0.5">
                    Near BRTS Stand, Varachha · 1 court · 6 AM – 11 PM
                  </p>
                </div>

                <Link
                  href={`/venues/${featuredVenue.slug}`}
                  className="bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-5 pr-2 py-2 rounded-full text-[15px] font-medium inline-flex items-center gap-2.5 w-fit"
                >
                  <span>Book</span>
                  <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Side: 3 Venue Cards + 1 Map Card */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherVenues.map((v) => (
                <VenueCard key={v.id} venue={v} slotInfo={slotCounts[v.id]} />
              ))}

              {/* Browse on the map card */}
              <Link
                href="/venues?view=map"
                className="bg-white border border-[#e3e5e8] hover:border-black rounded-[20px] p-6 flex flex-col justify-between group transition-all hover:shadow-md min-h-[220px]"
              >
                <div className="size-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h4 className="text-[18px] sm:text-[20px] font-normal text-black tracking-tight">
                    Browse on the map
                  </h4>
                  <p className="text-[14px] text-[#50555c] mt-1">
                    See every turf near you across Surat
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. LIVE SCORING SECTION (INTERACTIVE SHOWCASE)
            ======================================================== */}
        <section id="live-scores" className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Live Score Card (Dark Navy/Black) */}
            <div className="lg:col-span-8 bg-black rounded-[20px] p-6 sm:p-9 text-white flex flex-col justify-between gap-6 shadow-xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
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
            <div className="lg:col-span-4 bg-white border border-[#e3e5e8] rounded-[20px] p-6 sm:p-9 flex flex-col justify-between gap-6 group hover:shadow-md transition-all">
              <div className="size-12 rounded-full bg-black flex items-center justify-center text-white">
                <Image src="/figma/box-cricket-icon.svg" alt="" width={20} height={20} className="size-5" />
              </div>

              <div>
                <h3 className="text-[26px] sm:text-[28px] font-medium tracking-tight text-black leading-tight">
                  Score your own match, free
                </h3>
                <p className="text-[15px] text-[#50555c] mt-3 leading-relaxed">
                  Every booking comes with a live scoreboard your friends can follow anywhere.
                </p>
              </div>

              <Link
                href="/venues"
                className="group/cta bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-5 pr-2 py-2.5 rounded-full text-[15px] font-medium inline-flex items-center justify-between w-full"
              >
                <span>Start scoring</span>
                <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover/cta:translate-x-0.5">
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
          <h2 className="text-[34px] sm:text-[48px] font-normal tracking-[-0.035em] text-black mb-8">
            Three taps to the pitch
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="bg-white border border-[#e3e5e8] rounded-[20px] p-7 flex flex-col justify-between min-h-[240px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#1849c9] leading-none">
                01
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-black tracking-tight">Pick a turf</h3>
                <p className="text-[14px] text-[#50555c] mt-1.5 leading-relaxed">
                  Filter by area, price and time. Every slot shown is really free.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#eef1f4] rounded-[20px] p-7 flex flex-col justify-between min-h-[240px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#1849c9] leading-none">
                02
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-black tracking-tight">Choose your hour</h3>
                <p className="text-[14px] text-[#50555c] mt-1.5 leading-relaxed">
                  Tap a slot, add players and see the total upfront. No surprises.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#e3ebfa] rounded-[20px] p-7 flex flex-col justify-between min-h-[240px]">
              <span className="text-[56px] sm:text-[64px] font-medium tracking-tighter text-[#1849c9] leading-none">
                03
              </span>
              <div>
                <h3 className="text-[20px] font-normal text-black tracking-tight">Pay and play</h3>
                <p className="text-[14px] text-[#50555c] mt-1.5 leading-relaxed">
                  Pay with UPI or card. Your ticket and scoreboard are ready instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            8. CRICBOOKING IN NUMBERS
            ======================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-[#c9f13e] text-black rounded-[20px] p-7 flex flex-col justify-between min-h-[140px]">
              <span className="text-[44px] sm:text-[52px] font-medium tracking-tight leading-none">
                500+
              </span>
              <span className="text-[15px] sm:text-[16px] font-normal text-black">
                players this month
              </span>
            </div>

            <div className="bg-[#f4f6f8] text-black rounded-[20px] p-7 flex flex-col justify-between min-h-[140px]">
              <span className="text-[44px] sm:text-[52px] font-medium tracking-tight text-[#1849c9] leading-none">
                4
              </span>
              <span className="text-[15px] sm:text-[16px] font-normal text-black">
                venues live in Surat
              </span>
            </div>

            <div className="bg-[#f4f6f8] text-black rounded-[20px] p-7 flex flex-col justify-between min-h-[140px]">
              <span className="text-[44px] sm:text-[52px] font-medium tracking-tight text-[#1849c9] leading-none">
                ₹0
              </span>
              <span className="text-[15px] sm:text-[16px] font-normal text-black">
                booking fee, ever
              </span>
            </div>

            <div className="bg-[#042644] text-white rounded-[20px] p-7 flex flex-col justify-between min-h-[140px]">
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
          <h2 className="text-[34px] sm:text-[48px] font-normal tracking-[-0.035em] text-black mb-8">
            Players love it
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Testimonial 1 */}
            <div className="md:col-span-5 bg-[#f4f6f8] rounded-[20px] p-8 flex flex-col justify-between gap-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-4 fill-black text-black" />
                ))}
              </div>

              <blockquote className="text-[20px] sm:text-[22px] font-medium tracking-tight text-black leading-snug">
                “Booked Green Pitch at 7, playing by 8. The slot was exactly as shown.”
              </blockquote>

              <div className="flex items-center gap-3">
                <span className="size-10 rounded-full bg-[#c9f13e] text-black font-semibold text-sm flex items-center justify-center border-2 border-white">
                  UK
                </span>
                <div>
                  <p className="text-[15px] font-medium text-black">Urvil Kargathala</p>
                  <p className="text-[13px] text-[#50555c]">Varachha</p>
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
          <div className="bg-[#042644] rounded-[28px] sm:rounded-[36px] overflow-hidden p-8 sm:p-12 md:p-14 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
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
