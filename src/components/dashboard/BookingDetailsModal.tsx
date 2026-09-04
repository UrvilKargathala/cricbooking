'use client'

import { Mail, Phone, Calendar } from 'lucide-react'
import { formatPrice, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import type { Booking } from '@/types'

interface BookingDetailsModalProps {
  booking: Booking | null
  onClose: () => void
}

export function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  if (!booking) return <Modal isOpen={false} onClose={onClose} title="Booking Details">{null}</Modal>

  const name = booking.user?.full_name || booking.customer_name || 'Walk-in Customer'
  const phone = booking.user?.phone || booking.customer_phone
  const email = booking.user?.email
  const bookedAt = new Date(booking.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <Modal isOpen onClose={onClose} title="Booking Details">
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-surface-800/60">{booking.booking_code}</span>
          <Badge variant={booking.status}>{booking.status}</Badge>
        </div>

        {/* Customer info */}
        <div className="bg-surface-50 rounded-lg p-4 flex flex-col gap-2">
          <p className="font-semibold text-surface-900 text-base">{name}</p>
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-surface-800/70 hover:text-brand-600">
              <Phone className="w-3.5 h-3.5" /> {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-surface-800/70 hover:text-brand-600">
              <Mail className="w-3.5 h-3.5" /> {email}
            </a>
          )}
        </div>

        {/* Booking info */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-100">
          <div>
            <p className="text-xs text-surface-800/50">Court</p>
            <p className="font-medium text-surface-900">{booking.court?.name}</p>
          </div>
          <div>
            <p className="text-xs text-surface-800/50">Date & Time</p>
            <p className="font-medium text-surface-900">
              {booking.slot?.date}, {formatTime(booking.slot!.start_time)} – {formatTime(booking.slot!.end_time)}
            </p>
          </div>
          <div>
            <p className="text-xs text-surface-800/50">Amount</p>
            <p className="font-medium text-surface-900">{formatPrice(booking.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-surface-800/50">Payment</p>
            <Badge variant={booking.payment_status as 'approved'}>{booking.payment_status}</Badge>
          </div>
          <div>
            <p className="text-xs text-surface-800/50">Source</p>
            <Badge variant={booking.source}>{booking.source}</Badge>
          </div>
          <div>
            <p className="text-xs text-surface-800/50 flex items-center gap-1"><Calendar className="w-3 h-3" /> Booked on</p>
            <p className="font-medium text-surface-900">{bookedAt}</p>
          </div>
        </div>

        {booking.notes && (
          <div className="pt-3 border-t border-surface-100">
            <p className="text-xs text-surface-800/50">Notes</p>
            <p className="text-surface-800 mt-0.5 break-all">{booking.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
