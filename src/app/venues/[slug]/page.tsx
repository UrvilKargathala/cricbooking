'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VenueDetailClient } from '@/components/venue/VenueDetailClient'
import { fetchVenueBySlug } from '@/lib/supabase-queries'
import type { Venue } from '@/types'

export default function VenueDetailPage({ params }: { params: { slug: string } }) {
  const [venue, setVenue] = useState<Venue | null | undefined>(undefined)

  useEffect(() => {
    fetchVenueBySlug(params.slug).then((v) => setVenue(v))
  }, [params.slug])

  if (venue === undefined) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-surface-800/60 mt-4">Loading venue...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (!venue) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
          <MapPin className="w-10 h-10 text-surface-800/30 mx-auto mb-3" />
          <h1 className="font-display font-bold text-xl text-surface-900">Venue not found</h1>
          <p className="text-sm text-surface-800/60 mt-1">This venue doesn&apos;t exist or has been removed.</p>
          <Link href="/venues" className="text-brand-600 font-medium hover:underline text-sm mt-4 inline-block">
            Browse all venues
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <VenueDetailClient venue={venue} />
      <Footer />
    </>
  )
}
