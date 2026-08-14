'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { loadLocalVenues } from '@/lib/local-venues'
import { VenueDetailClient } from '@/components/venue/VenueDetailClient'
import type { Venue } from '@/types'

export function LocalVenueDetail({ slug }: { slug: string }) {
  const [venue, setVenue] = useState<Venue | null | undefined>(undefined)

  useEffect(() => {
    setVenue(loadLocalVenues().find((v) => v.slug === slug) ?? null)
  }, [slug])

  if (venue === undefined) return null
  if (venue === null) {
    return (
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
        <MapPin className="w-10 h-10 text-surface-800/30 mx-auto mb-3" />
        <h1 className="font-display font-bold text-xl text-surface-900">Venue not found</h1>
        <p className="text-sm text-surface-800/60 mt-1">This venue doesn&apos;t exist or was added on a different device.</p>
        <Link href="/venues" className="text-brand-600 font-medium hover:underline text-sm mt-4 inline-block">
          Browse all venues
        </Link>
      </main>
    )
  }

  return <VenueDetailClient venue={venue} />
}
