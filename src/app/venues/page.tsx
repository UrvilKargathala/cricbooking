'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { VenueCard } from '@/components/venue/VenueCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { fetchAreas, fetchVenues } from '@/lib/supabase-queries'
import { SPORT_LABELS } from '@/lib/utils'
import type { Area, SportType, Venue } from '@/types'

const SPORT_OPTIONS = Object.entries(SPORT_LABELS) as [SportType, string][]

type SortOption = 'default' | 'price_asc' | 'price_desc'

export default function VenuesPage() {
  return (
    <Suspense fallback={null}>
      <VenuesPageContent />
    </Suspense>
  )
}

function VenuesPageContent() {
  const searchParams = useSearchParams()
  const [selectedArea, setSelectedArea] = useState<string | null>(searchParams.get('area'))
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>(
    (searchParams.get('sport') as SportType | null) ?? 'all'
  )
  const [sort, setSort] = useState<SortOption>('default')
  const [query, setQuery] = useState('')
  const [areas, setAreas] = useState<Area[]>([])
  const [allVenues, setAllVenues] = useState<Venue[]>([])

  useEffect(() => {
    fetchAreas().then(setAreas)
    fetchVenues().then(setAllVenues)
  }, [])

  const venueMinPrice = (venue: Venue) =>
    venue.courts?.length ? Math.min(...venue.courts.map((c) => c.price_per_slot)) : Infinity

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    let venues = allVenues.filter((v) => {
      const matchesArea = !selectedArea || v.area?.slug === selectedArea
      const matchesSport = selectedSport === 'all' || v.sports.includes(selectedSport)
      const matchesQuery =
        !normalizedQuery ||
        v.name.toLowerCase().includes(normalizedQuery) ||
        v.area?.name.toLowerCase().includes(normalizedQuery)
      return matchesArea && matchesSport && matchesQuery
    })

    if (sort === 'price_asc') {
      venues = [...venues].sort((a, b) => venueMinPrice(a) - venueMinPrice(b))
    } else if (sort === 'price_desc') {
      venues = [...venues].sort((a, b) => venueMinPrice(b) - venueMinPrice(a))
    }

    return venues
  }, [allVenues, selectedArea, selectedSport, sort, query])

  const clearFilters = () => {
    setSelectedArea(null)
    setSelectedSport('all')
    setSort('default')
    setQuery('')
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-surface-900">All Venues in Surat</h1>
        <p className="text-sm text-surface-800/60 mt-1">{filteredVenues.length} venues found</p>

        <div className="mt-6 bg-white rounded-xl border border-surface-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative sm:w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search venues..."
              className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <select
              value={selectedArea ?? ''}
              onChange={(e) => setSelectedArea(e.target.value || null)}
              className="px-3 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area.slug} value={area.slug}>{area.name}</option>
              ))}
            </select>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value as SportType | 'all')}
              className="px-3 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="all">All Sports</option>
              {SPORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-3 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="default">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-surface-800/60 hover:text-brand-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredVenues.map((venue, index) => (
              <ScrollReveal key={venue.id} delay={(index % 3) * 100}>
                <VenueCard venue={venue} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <MapPin className="w-10 h-10 text-surface-800/30 mx-auto mb-3" />
            <p className="text-surface-800/60 mb-4">No venues match your filters.</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
