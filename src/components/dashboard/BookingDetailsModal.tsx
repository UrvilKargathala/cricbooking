'use client'

import { Phone } from 'lucide-react'
import { formatPrice, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import type { Booking } from '@/types'

interface BookingDetailsModalProps {
  booking: Booking | null
  onClose: () => void
}

export function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  return (
    <Modal isOpen={!!booking} onClose={onClose} title="Booking Details">
      {booking && (
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-surface-800/60">{booking.booking_code}</span>
            <Badge variant={booking.status}>{booking.status}</Badge>
          </div>

          <div>
            <p className="font-medium text-surface-900">
              {booking.user?.full_name || booking.customer_name || 'Walk-in Customer'}
            </p>
            {(booking.user?.phone || booking.customer_phone) && (
              <p className="flex items-center gap-1.5 text-surface-800/60 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                {booking.user?.phone || booking.customer_phone}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-100">
            <div>
              <p className="text-xs text-surface-800/50">Court</p>
              <p className="font-medium text-surface-900">{booking.court?.name}</p>
            </div>
            <div>
              <p className="text-xs text-surface-800/50">Date & Time</p>
              <p className="font-medium text-surface-900">
                {booking.slot?.date}, {formatTime(booking.slot!.start_time)} - {formatTime(booking.slot!.end_time)}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-800/50">Amount</p>
              <p className="font-medium text-surface-900">{formatPrice(booking.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-surface-800/50">Source</p>
              <Badge variant={booking.source}>{booking.source}</Badge>
            </div>
          </div>

          {booking.notes && (
            <div className="pt-3 border-t border-surface-100">
              <p className="text-xs text-surface-800/50">Notes</p>
              <p className="text-surface-800 mt-0.5">{booking.notes}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
