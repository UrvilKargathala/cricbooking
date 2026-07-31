'use client'

import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface BookingSummaryProps {
  selectedCount: number
  totalAmount: number
  onBook: () => void
}

export function BookingSummary({ selectedCount, totalAmount, onBook }: BookingSummaryProps) {
  if (selectedCount === 0) return null

  return (
    <div className="sticky bottom-4 bg-white rounded-xl border border-surface-200 shadow-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-surface-800/60">
          {selectedCount} slot{selectedCount > 1 ? 's' : ''} selected
        </p>
        <p className="font-display font-bold text-xl text-surface-900">{formatPrice(totalAmount)}</p>
      </div>
      <Button variant="primary" size="lg" onClick={onBook}>
        Book Now
      </Button>
    </div>
  )
}
