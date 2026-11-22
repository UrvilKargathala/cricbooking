'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Heart, ArrowUpRight, Clock3, Phone } from 'lucide-react'
import type { Venue } from '@/types'
import { formatPrice, formatTime, cn, SURFACE_LABELS } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import type { ReviewStats, VenueSlotInfo } from '@/lib/supabase-queries'

interface VenueCardProps {
  venue: Venue
  slotInfo?: VenueSlotInfo
  featured?: boolean
  reviewStats?: ReviewStats
}

export function venueLowestPrice(venue: Venue) {
  const prices = (venue.courts ?? []).map((court) => Number(court.price_per_slot)).filter((price) => Number.isFinite(price) && price > 0)
  return prices.length ? Math.min(...prices) : null
}

export function VenueCard({ venue, slotInfo, featured, reviewStats }: VenueCardProps) {
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(venue.id)

  const courts = venue.courts ?? []
  const bookable = courts.length > 0
  const minPrice = venueLowestPrice(venue)
  const surfaces = Array.from(new Set(courts.map((court) => SURFACE_LABELS[court.surface] ?? court.surface)))
  const floodlit = venue.amenities?.includes('lighting')
  const facts = [
    venue.area?.name || 'Surat',
    bookable ? `${courts.length} ${courts.length === 1 ? 'court' : 'courts'}` : null,
    surfaces.join(' & ') || null,
    floodlit ? 'Floodlit' : null,
  ].filter(Boolean)

  const nextSlot = slotInfo?.slots[0]
  const nextLabel = nextSlot
    ? `${slotInfo.isToday ? 'Today' : format(new Date(`${slotInfo.date}T00:00:00`), 'EEE d MMM')}, ${formatTime(nextSlot.start)}`
    : null

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await toggleFavorite(venue.id)
    if (result === 'signed_out') router.push('/login')
  }

  return (
    <div className="group relative bg-[#f4f6f8] rounded-[20px] p-3 sm:p-3.5 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <Link href={`/venues/${venue.slug}`} className="relative block aspect-[16/10] sm:aspect-[4/3] rounded-[16px] overflow-hidden bg-[#dde3ea]">
        <Image
          src={venue.cover_image || '/figma/venue-surat-arena.png'}
          alt={venue.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="bg-[#F59E0B] px-3 py-1 rounded-full text-[12px] sm:text-[13px] font-medium text-black flex items-center gap-1 shadow-sm">
            <span>{reviewStats?.count ? `★ ${reviewStats.average.toFixed(1)} (${reviewStats.count})` : 'New'}</span>
            {featured && <span>· Featured</span>}
          </div>
        </div>

        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 size-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-black/70 hover:text-red-500 transition-colors shadow-sm"
          aria-label={favorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={cn('size-4 transition-transform active:scale-125', favorite && 'fill-red-500 text-red-500')} />
        </button>
      </Link>

      <div className="flex flex-col gap-1 px-1">
        <Link href={`/venues/${venue.slug}`}>
          <h3 className="text-[17px] sm:text-[18px] font-medium tracking-tight text-black line-clamp-1">{venue.name}</h3>
        </Link>
        <p className="text-[13px] text-[#50555c] line-clamp-1">{facts.join(' · ')}</p>
        <p
          className={cn(
            'mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium',
            nextLabel ? 'text-[#92400E]' : 'text-[#6c6c6c]'
          )}
        >
          {bookable ? <Clock3 className="size-3.5 shrink-0" /> : <Phone className="size-3.5 shrink-0" />}
          <span className="line-clamp-1">
            {!bookable
              ? 'Online booking not set up yet'
              : nextLabel
              ? `Next: ${nextLabel} · ${slotInfo?.available} open`
              : `No open slots right now · ${formatTime(venue.opening_time)} – ${formatTime(venue.closing_time)}`}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#e3e5e8]/60 px-1 mt-auto">
        {minPrice ? (
          <div>
            <span className="text-[12px] text-[#6c6c6c]">from </span>
            <span className="text-[17px] sm:text-[18px] font-medium text-black">{formatPrice(minPrice)}</span>
            <span className="text-[12px] text-[#6c6c6c]">/hr</span>
          </div>
        ) : (
          <span className="text-[14px] font-medium text-[#50555c]">Call to book</span>
        )}

        <Link
          href={`/venues/${venue.slug}`}
          className="bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-3.5 pr-1.5 py-1.5 rounded-full text-[13px] font-medium inline-flex items-center gap-2 group/btn"
        >
          <span>{bookable ? 'Book' : 'View'}</span>
          <span className="size-6 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover/btn:translate-x-0.5">
            <ArrowUpRight className="size-3" strokeWidth={2.5} />
          </span>
        </Link>
      </div>
    </div>
  )
}
