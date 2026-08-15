'use client'

import { useState } from 'react'
import { Lock, Repeat, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react'
import { generateDemoSlots, DEMO_VENUES } from '@/lib/demo-data'
import { formatTime, formatPrice, cn } from '@/lib/utils'
import { DateSelector } from '@/components/booking/DateSelector'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/store/useToastStore'
import { Modal } from '@/components/ui/Modal'
import type { Slot } from '@/types'

const COURTS = DEMO_VENUES.slice(0, 2).flatMap((venue) => venue.courts ?? [])

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function SlotDetailModal({
  slot,
  onClose,
  onAction,
}: {
  slot: Slot | null
  onClose: () => void
  onAction: (action: string) => void
}) {
  if (!slot) return null

  return (
    <Modal isOpen={!!slot} onClose={onClose} title="Slot Details">
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-surface-500">Time</span>
          <span className="font-medium text-surface-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-surface-500">Price</span>
          <span className="font-semibold text-surface-900">{formatPrice(slot.price)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-surface-500">Status</span>
          <span className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full',
            slot.status === 'available' && 'bg-emerald-50 text-emerald-700',
            slot.status === 'booked' && 'bg-blue-50 text-blue-700',
            slot.status === 'blocked' && 'bg-red-50 text-red-700',
          )}>
            {slot.status[0].toUpperCase() + slot.status.slice(1)}
          </span>
        </div>

        {slot.status === 'booked' && (
          <div className="border-t border-surface-100 pt-3 mt-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-surface-500">Customer</span>
              <span className="font-medium text-surface-900">Raj Patel</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-500">Phone</span>
              <span className="text-surface-700">+91 98765 43210</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-500">Source</span>
              <span className="text-surface-700">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-500">Code</span>
              <span className="font-mono text-xs text-surface-500">CB-260809-A1X2</span>
            </div>
          </div>
        )}

        {slot.status === 'blocked' && slot.blocked_reason && (
          <div className="border-t border-surface-100 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-surface-500">Reason</span>
              <span className="text-surface-700">{slot.blocked_reason}</span>
            </div>
          </div>
        )}

        <div className="border-t border-surface-100 pt-3 mt-1">
          {slot.status === 'available' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('block')}
              className="w-full flex items-center justify-center gap-1.5 !text-red-600 !border-red-200 hover:!bg-red-50"
            >
              <Lock className="w-3.5 h-3.5" />
              Block This Slot
            </Button>
          )}
          {slot.status === 'blocked' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('unblock')}
              className="w-full flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Unblock This Slot
            </Button>
          )}
          {slot.status === 'booked' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('cancel')}
              className="w-full flex items-center justify-center gap-1.5 !text-red-600 !border-red-200 hover:!bg-red-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default function DashboardSlotsPage() {
  const [activeCourt, setActiveCourt] = useState(COURTS[0]?.id ?? '')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const showToast = useToastStore((s) => s.showToast)

  const activeCourtObj = COURTS.find((c) => c.id === activeCourt)
  const activeCourtName = activeCourtObj?.name ?? ''
  const slots = generateDemoSlots(activeCourt, selectedDate)

  const availableCount = slots.filter((s) => s.status === 'available').length
  const bookedCount = slots.filter((s) => s.status === 'booked').length
  const blockedCount = slots.filter((s) => s.status === 'blocked').length
  const totalSlots = slots.length
  const occupancyPct = totalSlots > 0 ? Math.round((bookedCount / totalSlots) * 100) : 0

  const handleSlotAction = (action: string) => {
    if (action === 'block') showToast('Slot blocked successfully.', 'success')
    else if (action === 'unblock') showToast('Slot unblocked.', 'info')
    else if (action === 'cancel') showToast('Booking cancellation coming in backend phase.', 'info')
    setSelectedSlot(null)
  }

  const STATS = [
    { label: 'Total Slots', value: String(totalSlots), icon: Calendar, bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Available', value: String(availableCount), icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { label: 'Booked', value: String(bookedCount), icon: Clock, bg: 'bg-brand-100', text: 'text-brand-600' },
    { label: 'Blocked', value: String(blockedCount), icon: Lock, bg: 'bg-red-100', text: 'text-red-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-surface-900">Slot Management</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage availability and block slots for your courts.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast(`All ${availableCount} available slots on ${selectedDate} for ${activeCourtName} would be blocked.`, 'info')}
            className="flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Block Entire Day
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showToast('Recurring block setting coming in backend phase.', 'info')}
            className="flex items-center gap-1.5"
          >
            <Repeat className="w-3.5 h-3.5" />
            Recurring Block
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 px-4 py-3.5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.text}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-surface-900">{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100">
          <div className="flex items-center gap-2 flex-wrap">
            {COURTS.map((court) => (
              <button
                key={court.id}
                onClick={() => setActiveCourt(court.id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  activeCourt === court.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                )}
              >
                {court.name}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3 text-sm text-surface-500">
              <span>Occupancy: <span className="font-semibold text-surface-900">{occupancyPct}%</span></span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-surface-100">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">
              {activeCourtName} — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </h2>
          </div>

          <div className="slot-grid">
            {slots.map((slot) => {
              const isBooked = slot.status === 'booked'
              const isBlocked = slot.status === 'blocked'

              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border text-xs transition-all',
                    isBooked && 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-sm',
                    isBlocked && 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-sm',
                    !isBooked && !isBlocked && 'bg-white border-surface-200 hover:border-brand-400 hover:bg-brand-50 hover:shadow-sm',
                  )}
                >
                  <span className={cn(
                    'font-semibold',
                    isBooked && 'text-blue-800',
                    isBlocked && 'text-red-800',
                    !isBooked && !isBlocked && 'text-surface-900',
                  )}>
                    {formatTime(slot.start_time)}
                  </span>
                  <span className={cn(
                    'text-[10px] font-medium',
                    isBooked && 'text-blue-600',
                    isBlocked && 'text-red-600',
                    !isBooked && !isBlocked && 'text-surface-400',
                  )}>
                    {isBooked ? 'Booked' : isBlocked ? 'Blocked' : formatPrice(slot.price)}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex gap-5 mt-5 pt-4 border-t border-surface-100 text-xs text-surface-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-surface-200 bg-white" />
              Available — click to block
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
              Booked — click for details
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
              Blocked — click to unblock
            </span>
          </div>
        </div>
      </div>

      <SlotDetailModal
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onAction={handleSlotAction}
      />
    </div>
  )
}
