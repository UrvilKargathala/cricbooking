'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VenueDetailClient } from '@/components/venue/VenueDetailClient'
import { fetchVenueBySlug } from '@/lib/supabase-queries'
import type { Venue } from '@/types'

export default function VenuePageClient({ slug }: { slug: string }) {
  const [venue, setVenue] = useState<Venue | null | undefined>(undefined)

  useEffect(() => {
    fetchVenueBySlug(slug)
      .then((v) => {
        setVenue(v && v.status === 'approved' ? v : null)
      })
      .catch(() => {
        setVenue(null)
      })
  }, [slug])

  if (venue === undefined) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-16" aria-busy="true" aria-label="Loading venue">
          <div className="aspect-[16/9] sm:aspect-[21/9] w-full animate-pulse rounded-[24px] bg-[#e6ebee]" />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[#e6ebee]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#eef1f3]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#eef1f3]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#eef1f3]" />
            </div>
            <div className="lg:col-span-5 space-y-3 rounded-[24px] border border-[#e6ebee] p-5">
              <div className="h-5 w-1/2 animate-pulse rounded bg-[#e6ebee]" />
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-[#eef1f3]" />
                ))}
              </div>
            </div>
          </div>
        </main>
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
