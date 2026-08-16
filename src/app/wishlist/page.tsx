'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { VenueCard } from '@/components/venue/VenueCard'
import { fetchVenues } from '@/lib/supabase-queries'
import { useFavorites } from '@/hooks/useFavorites'
import type { Venue } from '@/types'

export default function WishlistPage() {
  const { favoriteIds, loading } = useFavorites()
  const [allVenues, setAllVenues] = useState<Venue[]>([])

  useEffect(() => {
    fetchVenues().then(setAllVenues)
  }, [])

  const savedVenues = allVenues.filter((v) => favoriteIds.has(v.id))

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-surface-900">My Wishlist</h1>
        <p className="text-sm text-surface-800/60 mt-1">
          {loading ? 'Loading...' : `${savedVenues.length} venue${savedVenues.length === 1 ? '' : 's'} saved`}
        </p>

        {!loading && savedVenues.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-10 h-10 text-surface-800/30 mx-auto mb-3" />
            <p className="text-surface-800/60 mb-4">No venues saved yet — tap the heart on any venue to add it here.</p>
            <Link href="/venues">
              <Button variant="outline">Browse Venues</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {savedVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
