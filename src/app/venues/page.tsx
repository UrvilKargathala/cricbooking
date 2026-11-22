'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowUpDown, Clock3, MapPin, Search, Sparkles, X } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VenueCard, venueLowestPrice } from '@/components/venue/VenueCard'
import { fetchAreas, fetchReviewStats, fetchVenues, fetchTodaySlotCounts, type ReviewStats, type VenueSlotInfo } from '@/lib/supabase-queries'
import { AMENITY_LABELS } from '@/lib/utils'
import type { Area, Venue } from '@/types'

type FilterKey = 'type' | 'amenity' | 'timing' | 'time' | 'max_price'
const FILTER_KEYS: FilterKey[] = ['type', 'amenity', 'timing', 'time', 'max_price']

function filterLabel(key: FilterKey, value: string) {
  if (key === 'type') return value === 'box_cricket' ? 'Box cricket' : value === 'open_turf' ? 'Open turfs' : value
  if (key === 'amenity') return AMENITY_LABELS[value] ?? value
  if (key === 'timing') return 'Open late'
  if (key === 'time') return 'Open slots tonight'
  return `Under ₹${value}`
}

function playsSport(venue: Venue, sport: string) {
  return venue.sports?.includes(sport as Venue['sports'][number]) || (venue.courts ?? []).some((court) => court.sport === sport)
}

function matchesFilter(venue: Venue, key: FilterKey, value: string, slotInfo: VenueSlotInfo | undefined) {
  if (key === 'type') {
    if (value === 'box_cricket') return playsSport(venue, 'box_cricket')
    if (value === 'open_turf') return playsSport(venue, 'cricket')
    return true
  }
  if (key === 'amenity') return venue.amenities?.includes(value)
  if (key === 'timing') {
    const closing = venue.closing_time ?? ''
    return closing > '22:00' || (closing !== '' && closing < (venue.opening_time ?? ''))
  }
  if (key === 'time') return Boolean(slotInfo?.isToday && slotInfo.slots.some((slot) => slot.start >= '18:00'))
  const max = Number(value)
  const prices = (venue.courts ?? []).map((court) => Number(court.price_per_slot)).filter((price) => price > 0)
  return !Number.isFinite(max) || (prices.length > 0 && Math.min(...prices) <= max)
}

const QUICK_FILTERS: { key: FilterKey; value: string; label: string }[] = [
  { key: 'time', value: 'tonight', label: 'Open tonight' },
  { key: 'type', value: 'box_cricket', label: 'Box cricket' },
  { key: 'type', value: 'open_turf', label: 'Open turfs' },
  { key: 'amenity', value: 'lighting', label: 'Floodlights' },
  { key: 'timing', value: 'late', label: 'Open late' },
  { key: 'max_price', value: '700', label: 'Under ₹700' },
]

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price', label: 'Price: low to high' },
  { value: 'slots', label: 'Most open slots' },
  { value: 'rating', label: 'Top rated' },
] as const

type SortValue = (typeof SORTS)[number]['value']

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
  const selectedArea = searchParams.get('area')
  const sort = (SORTS.some((option) => option.value === searchParams.get('sort')) ? searchParams.get('sort') : 'recommended') as SortValue
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [areas, setAreas] = useState<Area[]>([])
  const [allVenues, setAllVenues] = useState<Venue[]>([])
  const [venuesLoading, setVenuesLoading] = useState(true)
  const [slotCounts, setSlotCounts] = useState<Record<string, VenueSlotInfo>>({})
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({})

  useEffect(() => {
    fetchAreas().then((res) => {
      if (res?.length) setAreas(res)
    }).catch(() => setAreas([]))
    fetchVenues()
      .then(setAllVenues)
      .catch(() => setAllVenues([]))
      .finally(() => setVenuesLoading(false))
    fetchTodaySlotCounts().then(setSlotCounts).catch(() => setSlotCounts({}))
    fetchReviewStats().then(setReviewStats).catch(() => setReviewStats({}))
  }, [])

  const updateParams = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(changes).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    router.replace(`/venues${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (query.trim() === current) return
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      if (query.trim()) params.set('q', query.trim())
      else params.delete('q')
      router.replace(`/venues${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [query, searchParams, router])

  const activeFilters = useMemo(
    () =>
      FILTER_KEYS.flatMap((key) => {
        const value = searchParams.get(key)
        return value ? [{ key, value }] : []
      }),
    [searchParams],
  )

  const toggleFilter = (key: FilterKey, value: string) => {
    updateParams({ [key]: searchParams.get(key) === value ? null : value })
  }

  const extraFilters = activeFilters.filter(
    ({ key, value }) => !QUICK_FILTERS.some((filter) => filter.key === key && filter.value === value)
  )

  const filteredVenues = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = allVenues.filter((v) => {
      const matchArea = !selectedArea || v.area?.slug === selectedArea
      const matchQuery =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.area?.name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
      const matchFilters = activeFilters.every(({ key, value }) => matchesFilter(v, key, value, slotCounts[v.id]))
      return matchArea && matchQuery && matchFilters
    })
    const todaySlots = (v: Venue) => (slotCounts[v.id]?.isToday ? slotCounts[v.id].available : 0)
    const anySlots = (v: Venue) => slotCounts[v.id]?.available ?? 0
    const rating = (v: Venue) => reviewStats[v.id]?.average ?? 0
    const bookable = (v: Venue) => ((v.courts?.length ?? 0) > 0 ? 1 : 0)
    return [...matches].sort((a, b) => {
      const bookableDiff = bookable(b) - bookable(a)
      if (bookableDiff) return bookableDiff
      if (sort === 'price') return (venueLowestPrice(a) ?? Infinity) - (venueLowestPrice(b) ?? Infinity)
      if (sort === 'slots') return todaySlots(b) - todaySlots(a) || anySlots(b) - anySlots(a)
      if (sort === 'rating') return rating(b) - rating(a) || (reviewStats[b.id]?.count ?? 0) - (reviewStats[a.id]?.count ?? 0)
      return Number(b.is_featured) - Number(a.is_featured) || Number(anySlots(b) > 0) - Number(anySlots(a) > 0) || rating(b) - rating(a)
    })
  }, [allVenues, selectedArea, query, activeFilters, slotCounts, reviewStats, sort])

  const areaOptions = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {}
    allVenues.forEach((v) => {
      if (!v.area?.slug) return
      counts[v.area.slug] = { name: v.area.name, count: (counts[v.area.slug]?.count ?? 0) + 1 }
    })
    if (selectedArea && !counts[selectedArea]) {
      const area = areas.find((a) => a.slug === selectedArea)
      counts[selectedArea] = { name: area?.name ?? selectedArea, count: 0 }
    }
    return Object.entries(counts)
      .map(([slug, info]) => ({ slug, ...info }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [allVenues, areas, selectedArea])

  const selectedAreaName = selectedArea ? areaOptions.find((a) => a.slug === selectedArea)?.name ?? selectedArea : null
  const placeName = selectedAreaName ?? 'Surat'
  const hasNarrowing = Boolean(selectedArea || query.trim() || activeFilters.length)

  const resetAll = () => {
    setQuery('')
    router.replace('/venues', { scroll: false })
  }

  return (
    <div className="bg-[#f7f9f7] min-h-screen text-black font-['Geist'] flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        <section className="bg-[#061923] pt-3 pb-6 sm:pt-7 sm:pb-14">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-[22px] sm:rounded-[32px] border border-white/10 bg-[#0a2939] px-4 py-5 sm:px-10 sm:py-11">
              <Image
                src="/figma/hero-cricket-stadium.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 1440px) 100vw, 1360px"
                className="object-cover object-right opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a2939] via-[#0a2939]/90 to-[#0a2939]/20" />
              <div className="relative max-w-[790px]">
                <p className="hidden sm:flex section-kicker mb-4 text-white/60">Surat’s cricket courts</p>
                <h1 className="text-[28px] sm:text-[56px] font-semibold tracking-[-0.04em] leading-[1.05] text-white">Your game starts <span className="text-[#FBBF24]">here.</span></h1>
                <p className="mt-2 sm:mt-4 text-[14px] sm:text-[17px] text-white/65">Find open slots and book in seconds.</p>
              </div>
              <div className="relative mt-4 sm:mt-7 flex w-full max-w-[680px] items-center gap-2 rounded-full bg-white p-1.5 pl-4 sm:p-2 sm:pl-5 shadow-[0_15px_40px_rgb(0_0_0_/_0.25)]">
                <Search className="size-5 text-[#63707a] shrink-0" />
                <input
                  type="search"
                  aria-label="Search turfs"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search turf name, area or address"
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 sm:py-2.5 text-[15px] text-black placeholder:text-[#7b858c]"
                />
                {query && (
                  <button onClick={() => setQuery('')} aria-label="Clear search" className="grid size-9 shrink-0 place-items-center rounded-full text-[#63707a] hover:bg-[#f4f6f8] hover:text-black">
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="relative mt-4 sm:mt-5 hidden sm:flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-white/65">
                <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-[#FBBF24]" />Instant confirmation</span>
                <Link href="/venues?time=tonight" className="inline-flex items-center gap-1.5 hover:text-white"><Clock3 className="size-3.5 text-[#FBBF24]" />See slots open tonight</Link>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-[#FBBF24]" />Across Surat</span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-7 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="section-kicker mb-3">Available to book</p>
              <h2 className="text-[26px] sm:text-[38px] font-semibold tracking-[-0.04em]">
                {venuesLoading
                  ? 'Finding turfs…'
                  : filteredVenues.length
                  ? `${filteredVenues.length} ${filteredVenues.length === 1 ? 'turf' : 'turfs'} in ${placeName}`
                  : `No turfs in ${placeName}${selectedArea ? ' yet' : ''}`}
              </h2>
            </div>
            <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e0e6e8] bg-white px-3.5 py-2 text-[14px] text-[#35444d]">
              <ArrowUpDown className="size-4 text-[#63707a]" />
              <span className="sr-only">Sort turfs</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value === 'recommended' ? null : e.target.value })}
                className="bg-transparent pr-1 font-medium text-black focus:outline-none cursor-pointer"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 mb-7">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" role="group" aria-label="Filter by area">
              <button
                onClick={() => updateParams({ area: null })}
                aria-pressed={!selectedArea}
                className={`shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-all whitespace-nowrap active:scale-95 ${
                  !selectedArea ? 'bg-[#042644] text-[#FBBF24]' : 'bg-white border border-[#e0e6e8] text-[#35444d] hover:border-[#042644]/40'
                }`}
              >
                All areas · {allVenues.length}
              </button>
              {areaOptions.map((area) => {
                const isActive = selectedArea === area.slug
                return (
                  <button
                    key={area.slug}
                    onClick={() => updateParams({ area: isActive ? null : area.slug })}
                    aria-pressed={isActive}
                    className={`shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-all whitespace-nowrap active:scale-95 ${
                      isActive ? 'bg-[#042644] text-[#FBBF24]' : 'bg-white border border-[#e0e6e8] text-[#35444d] hover:border-[#042644]/40 hover:bg-[#FEF7E6]'
                    }`}
                  >
                    {area.name} · {area.count}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" role="group" aria-label="Filter turfs">
              {QUICK_FILTERS.map((filter) => {
                const isActive = searchParams.get(filter.key) === filter.value
                return (
                  <button
                    key={`${filter.key}-${filter.value}`}
                    onClick={() => toggleFilter(filter.key, filter.value)}
                    aria-pressed={isActive}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                      isActive ? 'bg-[#F59E0B] text-[#042644]' : 'bg-[#FEF7E6] text-[#92400E] hover:bg-[#FEF3C7]'
                    }`}
                  >
                    {filter.label}
                    {isActive && <X className="size-3.5" />}
                  </button>
                )
              })}
              {extraFilters.map(({ key, value }) => (
                <button
                  key={key}
                  onClick={() => updateParams({ [key]: null })}
                  aria-label={`Remove filter ${filterLabel(key, value)}`}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[#F59E0B] text-[#042644]"
                >
                  {filterLabel(key, value)}
                  <X className="size-3.5" />
                </button>
              ))}
              {hasNarrowing && (
                <button onClick={resetAll} className="shrink-0 px-3 py-1.5 text-[13px] font-medium text-[#50555c] underline underline-offset-2 hover:text-black">
                  Clear all
                </button>
              )}
            </div>
          </div>

          {venuesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="Loading turfs">
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden rounded-[24px] border border-[#e0e6e8] bg-white">
                  <div className="aspect-[4/3] animate-pulse bg-[#e6ebee]" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-[#e6ebee]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#eef1f3]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVenues.map((v) => (
                <VenueCard key={v.id} venue={v} slotInfo={slotCounts[v.id]} featured={v.is_featured} reviewStats={reviewStats[v.id]} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-[#e0e6e8] rounded-[24px] p-8 flex flex-col items-center justify-center">
              <p className="text-[20px] font-medium text-black">
                {selectedArea && !query.trim() && !activeFilters.length ? `No turfs listed in ${placeName} yet` : 'No turfs match these filters'}
              </p>
              <p className="text-[14px] text-[#50555c] mt-1 max-w-md">
                {selectedArea && !query.trim() && !activeFilters.length
                  ? 'We’re adding venues across Surat. Try a nearby area, or browse every turf.'
                  : 'Try removing a filter or clearing your search.'}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button onClick={resetAll} className="bg-[#042644] text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-[#06345c]">
                  See all {allVenues.length} turfs
                </button>
                {areaOptions
                  .filter((area) => area.count > 0 && area.slug !== selectedArea)
                  .slice(0, 3)
                  .map((area) => (
                    <button key={area.slug} onClick={() => updateParams({ area: area.slug })} className="bg-white border border-[#e0e6e8] px-4 py-2.5 rounded-full text-[14px] font-medium text-[#35444d] hover:border-[#042644]/40">
                      {area.name} · {area.count}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
