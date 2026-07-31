import Link from 'next/link'
import { MapPin, Star, Clock } from 'lucide-react'
import type { Venue } from '@/types'
import { formatPrice, formatTime, SPORT_LABELS } from '@/lib/utils'

interface VenueCardProps {
  venue: Venue
}

export function VenueCard({ venue }: VenueCardProps) {
  const minPrice = venue.courts?.length
    ? Math.min(...venue.courts.map((c) => c.price_per_slot))
    : null

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group block bg-white rounded-xl border border-surface-200 hover:shadow-lg hover:border-brand-200 transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-[16/10]">
        {venue.cover_image ? (
          <img
            src={venue.cover_image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-600" />
        )}
        {venue.is_featured && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {minPrice !== null && (
          <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-sm font-display font-semibold text-brand-700">
            {formatPrice(minPrice)}/hr
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
          {venue.name}
        </h3>
        {venue.area && (
          <p className="flex items-center gap-1 text-sm text-surface-800/60 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {venue.area.name}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-3">
          {venue.sports.slice(0, 3).map((sport) => (
            <span
              key={sport}
              className="bg-brand-50 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {SPORT_LABELS[sport]}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-200">
          <span className="flex items-center gap-1 text-sm text-surface-800">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            {venue.rating.toFixed(1)}
            <span className="text-surface-800/50">({venue.total_reviews})</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-surface-800/60">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}
          </span>
        </div>
      </div>
    </Link>
  )
}
