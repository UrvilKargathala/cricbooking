'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, ArrowUpRight } from 'lucide-react'
import type { Venue } from '@/types'
import { formatPrice, formatTime, cn } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import type { VenueSlotInfo } from '@/lib/supabase-queries'

interface VenueCardProps {
  venue: Venue
  slotInfo?: VenueSlotInfo
  featured?: boolean
}

export function VenueCard({ venue, slotInfo, featured }: VenueCardProps) {
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(venue.id)

  const minPrice = venue.courts?.length
    ? Math.min(...venue.courts.map((c) => c.price_per_slot))
    : 600
  const courtCount = venue.courts?.length ?? 1

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await toggleFavorite(venue.id)
    if (result === 'signed_out') router.push('/login')
  }

  // Fallback image map
  const fallbackImg = venue.slug?.includes('green-pitch')
    ? '/figma/venue-green-pitch.png'
    : venue.slug?.includes('royal')
    ? '/figma/venue-royal-box.png'
    : venue.slug?.includes('sunset')
    ? '/figma/venue-sunset-turf.png'
    : '/figma/venue-surat-arena.png'

  const imgSrc = venue.cover_image || fallbackImg

  return (
    <div className="group relative bg-[#f4f6f8] rounded-[20px] p-3 sm:p-3.5 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image Container */}
      <Link href={`/venues/${venue.slug}`} className="relative block aspect-[16/10] sm:aspect-[4/3] rounded-[16px] overflow-hidden bg-[#dde3ea]">
        <Image
          src={imgSrc}
          alt={venue.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="bg-[#c9f13e] px-3 py-1 rounded-full text-[12px] sm:text-[13px] font-medium text-black flex items-center gap-1 shadow-sm">
            <span>★ {venue.rating ? Number(venue.rating).toFixed(1) : '4.6'}</span>
            {featured && <span>· Featured</span>}
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 size-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-black/70 hover:text-red-500 transition-colors shadow-sm"
          aria-label="Save to favorites"
        >
          <Heart className={cn('size-4 transition-transform active:scale-125', favorite && 'fill-red-500 text-red-500')} />
        </button>

        {/* Price Chip */}
        <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full text-[13px] font-medium text-black shadow-md">
          From {formatPrice(minPrice)}/hr
        </div>
      </Link>

      {/* Info Section */}
      <div className="flex flex-col gap-1 px-1">
        <Link href={`/venues/${venue.slug}`} className="group-hover:text-black">
          <h3 className="text-[17px] sm:text-[18px] font-medium tracking-tight text-black line-clamp-1">
            {venue.name}
          </h3>
        </Link>
        <p className="text-[13px] sm:text-[14px] text-[#50555c] line-clamp-1">
          {venue.area?.name || 'Surat'} · {courtCount} court{courtCount > 1 ? 's' : ''} {slotInfo ? `· ${slotInfo.available} free slots` : `· ${venue.opening_time ? formatTime(venue.opening_time) : '6 AM'} – ${venue.closing_time ? formatTime(venue.closing_time) : '11 PM'}`}
        </p>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#e3e5e8]/60 px-1 mt-auto">
        <div>
          <span className="text-[17px] sm:text-[18px] font-medium text-black">
            {formatPrice(minPrice)}
          </span>
          <span className="text-[12px] text-[#6c6c6c]">/hr</span>
        </div>

        <Link
          href={`/venues/${venue.slug}`}
          className="bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-3.5 pr-1.5 py-1.5 rounded-full text-[13px] font-medium inline-flex items-center gap-2 group/btn"
        >
          <span>Book</span>
          <span className="size-6 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover/btn:translate-x-0.5">
            <ArrowUpRight className="size-3" strokeWidth={2.5} />
          </span>
        </Link>
      </div>
    </div>
  )
}
