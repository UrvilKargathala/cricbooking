import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatTime } from '@/lib/utils'
import type { Booking } from '@/types'

interface BookingCardProps {
  booking: Booking
  showCancel?: boolean
  onCancel?: () => void
}

export function BookingCard({ booking, showCancel, onCancel }: BookingCardProps) {
  const fallbackImg = booking.venue?.slug?.includes('green-pitch')
    ? '/figma/venue-green-pitch.png'
    : booking.venue?.slug?.includes('royal')
    ? '/figma/venue-royal-box.png'
    : booking.venue?.slug?.includes('sunset')
    ? '/figma/venue-sunset-turf.png'
    : '/figma/venue-surat-arena.png'

  const imgSrc = booking.venue?.cover_image || fallbackImg

  return (
    <div className="bg-[#f4f6f8] rounded-[20px] p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 group hover:shadow-md transition-all">
      <div className="flex items-center gap-4 min-w-0">
        {/* Venue image */}
        <div className="relative size-20 sm:size-24 rounded-[16px] overflow-hidden bg-[#dde3ea] shrink-0">
          <Image src={imgSrc} alt={booking.venue?.name || ''} fill className="object-cover" sizes="(max-width: 640px) 100vw, 200px" />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant={booking.status === 'confirmed' ? 'confirmed' : 'chip'}>
              {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
            </Badge>
            <span className="text-[12px] text-[#6c6c6c] font-mono">
              #{booking.booking_code || booking.id.slice(0, 8)}
            </span>
          </div>

          <h3 className="text-[17px] sm:text-[18px] font-medium text-black tracking-tight mt-0.5 truncate">
            {booking.venue?.name || 'Cricket Venue'}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#50555c]">
            {booking.court && <span>{booking.court.name}</span>}
            {booking.slot && (
              <>
                <span>·</span>
                <span>
                  {new Date(booking.slot.date + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  , {formatTime(booking.slot.start_time)}
                </span>
              </>
            )}
            <span>·</span>
            <span className="font-medium text-black">{formatPrice(booking.amount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#e3e5e8]">
        {showCancel && booking.status === 'confirmed' && onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-[13px] font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
          >
            Cancel
          </button>
        )}

        <Link
          href={`/bookings/${booking.id}`}
          className="bg-black hover:bg-neutral-800 text-white pl-4 pr-1.5 py-1.5 rounded-full text-[13px] font-medium inline-flex items-center gap-2 transition-colors ml-auto sm:ml-0"
        >
          <span>View Ticket</span>
          <span className="size-6 rounded-full bg-[#F59E0B] text-black flex items-center justify-center">
            <ArrowUpRight className="size-3" strokeWidth={2.5} />
          </span>
        </Link>
      </div>
    </div>
  )
}
