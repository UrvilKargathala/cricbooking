'use client'

import { useState } from 'react'
import { Lock, Repeat } from 'lucide-react'
import { generateDemoSlots, DEMO_VENUES } from '@/lib/demo-data'
import { formatTime, formatPrice, cn } from '@/lib/utils'
import { DateSelector } from '@/components/booking/DateSelector'
import { Button } from '@/components/ui/Button'

const COURTS = DEMO_VENUES.slice(0, 2).flatMap((venue) => venue.courts ?? [])

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function DashboardSlotsPage() {
  const [activeCourt, setActiveCourt] = useState(COURTS[0]?.id ?? '')
  const [selectedDate, setSelectedDate] = useState(todayStr())

  const activeCourtName = COURTS.find((c) => c.id === activeCourt)?.name ?? ''
  const slots = generateDemoSlots(activeCourt, selectedDate)

  const availableCount = slots.filter((s) => s.status === 'available').length
  const bookedCount = slots.filter((s) => s.status === 'booked').length
  const blockedCount = slots.filter((s) => s.status === 'blocked').length

  return (
    <div>
      <h1 className="font-display font-bold text-xl text-surface-900 mb-6">Slot Management</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {COURTS.map((court) => (
          <button
            key={court.id}
            onClick={() => setActiveCourt(court.id)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeCourt === court.id
                ? 'bg-brand-600 text-white'
                : 'bg-surface-100 text-surface-800/70 hover:bg-surface-200'
            )}
          >
            {court.name}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display font-semibold text-surface-900">Slots for {activeCourtName}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              alert(
                `Block all available slots on ${selectedDate} for ${activeCourtName}?\n\n${availableCount} slot(s) will be blocked and made unavailable to users.`
              )
            }
            className="flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Block Entire Day
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const reason = window.prompt('Recurring block reason (e.g. "Weekly maintenance"):', 'Maintenance')
              if (reason) {
                alert(
                  `Recurring block set for ${activeCourtName}\n\nEvery week on this day, going forward.\nReason: ${reason}`
                )
              }
            }}
            className="flex items-center gap-1.5"
          >
            <Repeat className="w-3.5 h-3.5" />
            Set Recurring Block
          </Button>
        </div>
      </div>

      <div className="slot-grid">
        {slots.map((slot) => {
          if (slot.status === 'booked') {
            return (
              <button
                key={slot.id}
                onClick={() =>
                  alert(
                    'Booking Details\n\nTime: ' +
                      formatTime(slot.start_time) +
                      '\nCustomer: Raj Patel\nPhone: +91 98765 43210\nSource: Online\nAmount: ₹1,200\nCode: CB-260809-A1X2'
                  )
                }
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg border bg-brand-50 border-brand-200 cursor-pointer text-xs"
              >
                <span className="font-medium text-brand-800">{formatTime(slot.start_time)}</span>
                <span className="text-brand-600">Booked</span>
              </button>
            )
          }
          if (slot.status === 'blocked') {
            return (
              <button
                key={slot.id}
                onClick={() =>
                  alert(
                    'Unblock this slot?\n\nTime: ' +
                      formatTime(slot.start_time) +
                      '\nReason: Maintenance\n\nUnblocking will make this slot available to users.'
                  )
                }
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg border bg-red-50 border-red-200 cursor-pointer text-xs"
              >
                <span className="font-medium text-red-800">{formatTime(slot.start_time)}</span>
                <span className="text-red-600">Blocked</span>
              </button>
            )
          }
          return (
            <button
              key={slot.id}
              onClick={() =>
                alert(
                  'Block this slot?\n\nTime: ' +
                    formatTime(slot.start_time) +
                    '\nPrice: ' +
                    formatPrice(slot.price) +
                    '\n\nBlocking will make this slot unavailable to users.'
                )
              }
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg border bg-white border-surface-200 hover:border-brand-400 hover:bg-brand-50 cursor-pointer text-xs"
            >
              <span className="font-medium text-surface-800">{formatTime(slot.start_time)}</span>
              <span className="text-surface-800/70">{formatPrice(slot.price)}</span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-surface-800/50 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-surface-200 bg-white" />
          Available — click to block
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-50 border border-brand-200" />
          Booked — click for details
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
          Blocked — click to unblock
        </span>
      </div>

      <div className="flex gap-6 mt-4 text-sm">
        <span className="text-surface-800/70">Available: {availableCount}</span>
        <span className="text-brand-600">Booked: {bookedCount}</span>
        <span className="text-red-600">Blocked: {blockedCount}</span>
      </div>
    </div>
  )
}
