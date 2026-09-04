import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import VenuePageClient from './VenuePageClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: venue } = await supabase
    .from('venues')
    .select('name, description, cover_image, area:areas(name)')
    .eq('slug', params.slug)
    .single()

  if (!venue) {
    return { title: 'Venue Not Found — CricBooking' }
  }

  const areaName = (venue.area as unknown as { name: string } | null)?.name
  const title = `${venue.name}${areaName ? `, ${areaName}` : ''} — CricBooking`
  const description = venue.description
    || `Book ${venue.name} on CricBooking. Real-time availability, instant confirmation.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: venue.cover_image ? [{ url: venue.cover_image, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default function VenueDetailPage({ params }: { params: { slug: string } }) {
  return <VenuePageClient slug={params.slug} />
}
