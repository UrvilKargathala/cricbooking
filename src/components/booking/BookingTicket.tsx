'use client'

import { formatPrice, formatTime } from '@/lib/utils'
import type { Booking } from '@/types'

export function BookingTicket({ booking, delayMs }: { booking: Booking; delayMs: number }) {
  return (
    <div className="relative" style={{ animationDelay: `${delayMs}ms` }}>
      {/* Printer housing */}
      <div className="relative h-4 bg-surface-800 rounded-t-lg mx-2">
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-[3px] bg-black/40 rounded-full" />
      </div>

      {/* Receipt paper — prints out top-down */}
      <div className="receipt-print" style={{ animationDelay: `${delayMs}ms` }}>
        <div className="relative bg-white shadow-md px-5 pt-5 pb-4 font-mono text-[13px] text-surface-800">
          <span
            className="stamp-enter absolute top-3 right-4 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border-2 border-emerald-600 rounded px-1.5 py-0.5"
            style={{ animationDelay: `${delayMs + 450}ms` }}
          >
            Confirmed
          </span>

          <p className="font-display font-bold text-sm text-surface-900 text-center">{booking.venue?.name}</p>
          <p className="text-[11px] text-surface-800/50 text-center mt-0.5">
            {booking.venue?.area?.name} · {booking.court?.name}
          </p>

          <div className="border-t border-dashed border-surface-300 my-3" />

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-surface-800/50">Date</span>
              <span>{booking.slot?.date}</span>
            </div>
            {booking.slot && (
              <div className="flex justify-between">
                <span className="text-surface-800/50">Time</span>
                <span>{formatTime(booking.slot.start_time)} – {formatTime(booking.slot.end_time)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-surface-800/50">Amount Paid</span>
              <span className="font-semibold text-surface-900">{formatPrice(booking.amount)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-surface-300 my-3" />

          <div className="text-center">
            <p className="text-[11px] text-surface-800/50">Booking Code</p>
            <p className="font-semibold text-brand-700 tracking-wide mt-0.5">{booking.booking_code}</p>
          </div>

          <div className="barcode mt-3 h-8" />
        </div>
        <div className="torn-edge" />
      </div>
    </div>
  )
}
