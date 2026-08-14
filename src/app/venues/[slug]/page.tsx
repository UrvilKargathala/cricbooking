import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VenueDetailClient } from '@/components/venue/VenueDetailClient'
import { LocalVenueDetail } from '@/components/venue/LocalVenueDetail'
import { DEMO_VENUES } from '@/lib/demo-data'

interface VenuePageProps {
  params: { slug: string }
}

export function generateMetadata({ params }: VenuePageProps): Metadata {
  const venue = DEMO_VENUES.find((v) => v.slug === params.slug)
  if (!venue) return { title: 'Venue Not Found - CricBooking' }

  return {
    title: `${venue.name} - Book Now | CricBooking`,
    description: venue.description ?? `Book ${venue.name} in ${venue.area?.name ?? 'Surat'} on CricBooking.`,
  }
}

export default function VenueDetailPage({ params }: VenuePageProps) {
  const venue = DEMO_VENUES.find((v) => v.slug === params.slug)

  return (
    <>
      <Header />
      {venue ? <VenueDetailClient venue={venue} /> : <LocalVenueDetail slug={params.slug} />}
      <Footer />
    </>
  )
}
