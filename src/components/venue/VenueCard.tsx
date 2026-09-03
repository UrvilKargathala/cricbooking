'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Clock, Heart, Layers, MessageSquare, IndianRupee } from 'lucide-react'
import type { Venue } from '@/types'
import { formatPrice, formatTime, SPORT_LABELS, cn } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'

interface VenueCardProps {
  venue: Venue
}

export function VenueCard({ venue }: VenueCardProps) {
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(venue.id)

  const minPrice = venue.courts?.length
    ? Math.min(...venue.courts.map((c) => c.price_per_slot))
    : null
  const courtCount = venue.courts?.length ?? 0

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await toggleFavorite(venue.id)
    if (result === 'signed_out') router.push('/login')
  }

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group block bg-white rounded-2xl border border-surface-200 hover:shadow-lg hover:border-brand-200 transition-all duration-300 overflow-hidden"
    >
      <div className="relative p-2">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          {venue.cover_image ? (
            <img
              src={venue.cover_image}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-600" />
          )}
          <span
            className={cn(
              'absolute top-3 left-3 text-xs font-medium px-3 py-1.5 rounded-full',
              venue.is_featured ? 'bg-brand-800 text-white' : 'bg-black/50 text-white backdrop-blur-sm'
            )}
          >
            {venue.is_featured ? 'Featured' : SPORT_LABELS[venue.sports[0]] ?? 'Sports'}
          </span>
          <button
            onClick={handleToggleFavorite}
            aria-label={favorite ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <Heart className={cn('w-4 h-4', favorite ? 'fill-red-500 text-red-500' : 'text-white')} />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-brand-600 truncate">{venue.area?.name ?? venue.city}</span>
          {minPrice !== null && (
            <span className="flex items-center gap-1 text-sm text-surface-800/60 shrink-0">
              <IndianRupee className="w-3.5 h-3.5" />
              {formatPrice(minPrice).replace('₹', '')}/hr
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-lg text-surface-900 mt-0.5 group-hover:text-brand-700 transition-colors truncate">
          {venue.name}
        </h3>

        <div className="border-t border-surface-100 mt-3 pt-3 flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm text-surface-800/70">
            <MapPin className="w-4 h-4 text-surface-800/40 shrink-0" />
            <span className="truncate">{venue.address}</span>
          </span>
          <span className="flex items-center gap-2 text-sm text-surface-800/70">
            <Layers className="w-4 h-4 text-surface-800/40 shrink-0" />
            {courtCount} Court{courtCount === 1 ? '' : 's'}
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-surface-800/70">
              <Clock className="w-4 h-4 text-surface-800/40 shrink-0" />
              {formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}
            </span>
            <span className="flex items-center gap-3 shrink-0">
              {venue.total_reviews > 0 ? (
                <span className="flex items-center gap-1 text-sm text-surface-800">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {venue.rating.toFixed(1)}
                </span>
              ) : (
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">New</span>
              )}
              <span className="flex items-center gap-1 text-sm text-surface-800/60">
                <MessageSquare className="w-4 h-4" />
                {venue.total_reviews}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
