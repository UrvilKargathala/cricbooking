'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Clock, Heart, Layers, MessageSquare, IndianRupee, CalendarCheck } from 'lucide-react'
import type { Venue } from '@/types'
import { formatPrice, formatTime, SPORT_LABELS, cn } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import type { VenueSlotInfo } from '@/lib/supabase-queries'

interface VenueCardProps {
  venue: Venue
  slotInfo?: VenueSlotInfo
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function SlotStrip({ info }: { info: VenueSlotInfo }) {
  const [offset, setOffset] = useState(0)
  const slots = info.slots

  useEffect(() => {
    if (slots.length <= 4) return
    const id = setInterval(() => setOffset((o) => (o + 1) % slots.length), 2500)
    return () => clearInterval(id)
  }, [slots.length])

  if (slots.length === 0) return null

  const displaySlots = slots.length > 4
    ? Array.from({ length: 4 }, (_, i) => slots[(offset + i) % slots.length])
    : slots

  return (
    <div className="bg-surface-900 rounded-xl px-4 py-2.5 mt-2 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <CalendarCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-xs font-medium text-white/90">
          {info.available} slot{info.available === 1 ? '' : 's'} · {info.isToday ? 'Today' : formatShortDate(info.date)}
        </span>
      </div>
      <div className="flex gap-1.5 overflow-hidden">
        {displaySlots.map((slot, i) => (
          <span
            key={`${slot.start}-${i}`}
            className="text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all duration-300"
          >
            {formatTime(slot.start)}
          </span>
        ))}
        {slots.length > 4 && (
          <span className="text-[11px] text-white/40 px-1 py-1 self-center">
            +{slots.length - 4}
          </span>
        )}
      </div>
    </div>
  )
}

export function VenueCard({ venue, slotInfo }: VenueCardProps) {
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
    <div>
    <Link
      href={`/venues/${venue.slug}`}
      className="group block bg-white rounded-2xl border border-surface-200 hover:shadow-lg hover:border-brand-200 transition-all duration-300 overflow-hidden"
    >
      <div className="relative p-2 pb-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          {venue.cover_image ? (
            <Image
              src={venue.cover_image}
              alt={venue.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

      <div className="px-5 pb-5 pt-3">
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
    {slotInfo?.slots.length ? <SlotStrip info={slotInfo} /> : null}
    </div>
  )
}
