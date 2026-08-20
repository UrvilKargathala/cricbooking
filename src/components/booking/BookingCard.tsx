import Link from 'next/link'
import { Calendar, Clock, ChevronRight, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatTime } from '@/lib/utils'
import type { Booking } from '@/types'

interface BookingCardProps {
  booking: Booking
  showCancel?: boolean
  onCancel?: () => void
}

export function BookingCard({ booking, showCancel, onCancel }: BookingCardProps) {
  return (
    <Link href={`/bookings/${booking.id}`} className="block">
      <div className="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md hover:border-brand-200 transition-all group">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-surface-800/70">{booking.booking_code}</span>
          <Badge variant={booking.status}>{booking.status.replace('_', ' ')}</Badge>
        </div>

        <h3 className="font-display font-semibold text-surface-900 mt-2 group-hover:text-brand-700 transition-colors">{booking.venue?.name}</h3>
        {booking.court && <p className="text-sm text-surface-800/60">{booking.court.name}</p>}

        {booking.slot && (
          <div className="flex items-center gap-4 mt-3 text-sm text-surface-800">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-surface-800/50" />
              {new Date(booking.slot.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-surface-800/50" />
              {formatTime(booking.slot.start_time)} - {formatTime(booking.slot.end_time)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-200">
          <span className="font-display font-semibold text-brand-700">{formatPrice(booking.amount)}</span>
          <div className="flex items-center gap-2">
            {showCancel && booking.status === 'confirmed' && onCancel && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-600 hover:bg-red-50"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel() }}
              >
                Cancel
              </Button>
            )}
            {!showCancel && booking.status !== 'confirmed' && booking.venue?.slug && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/venues/${booking.venue!.slug}` }}
              >
                <RotateCcw className="w-3 h-3" /> Book Again
              </Button>
            )}
            <ChevronRight className="w-4 h-4 text-surface-800/30 group-hover:text-brand-600 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}
