'use client'

import { Button } from '@/components/ui/Button'
import { formatPrice, formatTime } from '@/lib/utils'
import type { Court, Slot } from '@/types'

interface BookingSummaryProps {
  court: Court | null
  selectedDate: string
  selectedSlots: Slot[]
  areaName?: string
  onBook: () => void
  loading?: boolean
}

export function BookingSummary({ court, selectedDate, selectedSlots, areaName, onBook, loading }: BookingSummaryProps) {
  const totalAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0)
  const sorted = [...selectedSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))
  const hasSelection = sorted.length > 0

  const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  const timeLabel = hasSelection
    ? sorted.length === 1
      ? `${formatTime(sorted[0].start_time)} – ${formatTime(sorted[0].end_time)}`
      : `${sorted.length} slots · ${formatTime(sorted[0].start_time)} onward`
    : '—'

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-5 sticky top-20">
      <h3 className="font-display font-semibold text-surface-900">Booking Summary</h3>
      <p className="text-xs text-surface-800/50 mt-1">Review your selected date, time, and court.</p>

      <div className="bg-surface-50 rounded-lg p-3 mt-4">
        <p className="text-xs text-surface-800/50">Court</p>
        <p className="text-sm font-medium text-surface-900">{court?.name ?? '—'}</p>
      </div>

      <div className="flex flex-col gap-2.5 mt-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-surface-800/50">Date</span>
          <span className="text-surface-900 font-medium">{dateLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-surface-800/50">Time</span>
          <span className="text-surface-900 font-medium">{timeLabel}</span>
        </div>
        {areaName && (
          <div className="flex items-center justify-between">
            <span className="text-surface-800/50">Area</span>
            <span className="text-surface-900 font-medium">{areaName}</span>
          </div>
        )}
      </div>

      <div className="border-t border-surface-200 mt-4 pt-4 flex items-center justify-between">
        <span className="text-sm text-surface-800/60">Estimated total</span>
        <span className="font-display font-bold text-xl text-surface-900">{formatPrice(totalAmount)}</span>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onBook}
        disabled={!hasSelection || loading}
        className="w-full mt-4"
      >
        {loading ? 'Processing...' : 'Book Now'}
      </Button>
      <p className="text-xs text-surface-800/40 text-center mt-2">
        Free cancellation as per venue policy
      </p>
    </div>
  )
}
