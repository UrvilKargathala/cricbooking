'use client'

import { ArrowUpRight } from 'lucide-react'
import { formatPrice, formatTime } from '@/lib/utils'
import type { Court, Slot } from '@/types'

interface BookingSummaryProps {
  court: Court | null
  selectedDate: string
  selectedSlots: Slot[]
  areaName?: string
  onBook: () => void
  loading?: boolean
  cancellationHours?: number | null
  refundPct?: number | null
}

export function BookingSummary({
  court,
  selectedDate,
  selectedSlots,
  areaName,
  onBook,
  loading,
  cancellationHours = null,
  refundPct = null,
}: BookingSummaryProps) {
  const totalAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0)
  const sorted = [...selectedSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))
  const hasSelection = sorted.length > 0

  const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  const timeLabel = hasSelection
    ? sorted.length === 1
      ? `${formatTime(sorted[0].start_time)} – ${formatTime(sorted[0].end_time)}`
      : `${formatTime(sorted[0].start_time)} – ${formatTime(sorted[sorted.length - 1].end_time)} (${sorted.length} hrs)`
    : 'Not picked yet'

  return (
    <div className="bg-[#f4f6f8] rounded-[24px] p-6 lg:sticky lg:top-24 border border-[#e3e5e8]/80 shadow-sm flex flex-col gap-5">
      <div>
        <h3 className="text-[20px] font-medium tracking-tight text-black">Booking summary</h3>
        <p className="text-[13px] text-[#50555c] mt-0.5">Review your timing and court.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[11px] text-[#6c6c6c] uppercase tracking-wider font-medium">Court</span>
          <p className="text-[15px] font-medium text-black">{hasSelection && court ? court.name : 'Pick a time first'}</p>
        </div>
        {areaName && (
          <div className="text-right">
            <span className="text-[11px] text-[#6c6c6c] uppercase tracking-wider font-medium">Location</span>
            <p className="text-[14px] text-[#50555c]">{areaName}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 text-[14px]">
        <div className="flex items-center justify-between">
          <span className="text-[#50555c]">Date</span>
          <span className="font-medium text-black">{dateLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#50555c]">Slot(s)</span>
          <span className="font-medium text-black">{timeLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#50555c]">Platform fee</span>
          <span className="font-medium text-[#92400E]">₹0 (Free)</span>
        </div>
      </div>

      <div className="border-t border-[#e3e5e8] pt-4 flex items-center justify-between">
        <span className="text-[15px] text-[#50555c]">Total payable</span>
        {hasSelection ? (
          <span className="text-[24px] font-medium text-black leading-none">{formatPrice(totalAmount)}</span>
        ) : (
          <span className="text-[14px] text-[#6c6c6c]">Pick a time to see your total</span>
        )}
      </div>

      <button
        type="button"
        onClick={onBook}
        disabled={!hasSelection || loading}
        className="group bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium flex items-center justify-between w-full disabled:bg-[#e3e5e8] disabled:text-[#6c6c6c] disabled:hover:bg-[#e3e5e8] disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm active:scale-95"
      >
        <span>{loading ? 'Processing...' : hasSelection ? 'Proceed to pay' : 'Pick a time above'}</span>
        <span className="size-8 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
          <ArrowUpRight className="size-4" strokeWidth={2.5} />
        </span>
      </button>

      <div className="flex flex-col gap-1.5 text-center text-[12px] text-[#5f656c]">
        {cancellationHours !== null && (
          <p>
            {refundPct && refundPct > 0
              ? `Cancel up to ${cancellationHours} hours before your slot for a ${refundPct === 100 ? 'full' : `${refundPct}%`} refund.`
              : 'Bookings at this venue can’t be refunded after payment.'}
          </p>
        )}
        <p>Instant confirmation with a QR ticket.</p>
      </div>
    </div>
  )
}
