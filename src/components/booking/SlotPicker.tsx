'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Lock } from 'lucide-react'
import { cn, formatPrice, formatTime } from '@/lib/utils'
import { DateSelector } from './DateSelector'
import { BookingSummary } from './BookingSummary'
import type { Court, Slot } from '@/types'

interface SlotPickerProps {
  courts: Court[]
  slots: Slot[]
  selectedDate: string
  onDateChange: (date: string) => void
  onBook: (selectedSlots: Slot[], totalAmount: number) => void
  justUpdated?: Set<string>
  bookingLoading?: boolean
}

const TIME_GROUPS = [
  { label: 'Morning', startHour: 0, endHour: 12 },
  { label: 'Afternoon', startHour: 12, endHour: 17 },
  { label: 'Night', startHour: 17, endHour: 24 },
]

function groupByTimeOfDay(slots: Slot[]) {
  return TIME_GROUPS.map((group) => ({
    ...group,
    slots: slots.filter((slot) => {
      const hour = Number(slot.start_time.slice(0, 2))
      return hour >= group.startHour && hour < group.endHour
    }),
  })).filter((group) => group.slots.length > 0)
}

export function SlotPicker({ courts, slots, selectedDate, onDateChange, onBook, justUpdated, bookingLoading }: SlotPickerProps) {
  const [activeCourt, setActiveCourt] = useState(courts[0]?.id ?? '')
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([])

  useEffect(() => {
    setSelectedSlots([])
  }, [activeCourt, selectedDate])

  const courtSlots = slots.filter((s) => s.court_id === activeCourt)
  const slotGroups = groupByTimeOfDay(courtSlots)

  useEffect(() => {
    setSelectedSlots((prev) => prev.filter((s) => {
      const current = slots.find((sl) => sl.id === s.id)
      return current?.status === 'available'
    }))
  }, [slots])

  const toggleSlot = (slot: Slot) => {
    if (slot.status !== 'available') return
    setSelectedSlots((prev) =>
      prev.some((s) => s.id === slot.id)
        ? prev.filter((s) => s.id !== slot.id)
        : [...prev, slot]
    )
  }

  const totalAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="flex flex-col gap-4">
      {courts.length > 1 && (
        <div className="flex gap-2">
          {courts.map((court) => (
            <button
              key={court.id}
              onClick={() => setActiveCourt(court.id)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center',
                activeCourt === court.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 text-surface-800 hover:bg-surface-200'
              )}
            >
              <span className="block">{court.name}</span>
              <span className={cn('block text-xs', activeCourt === court.id ? 'text-white/80' : 'text-surface-800/50')}>
                From {formatPrice(court.price_per_slot)}
              </span>
            </button>
          ))}
        </div>
      )}

      <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} />

      <div className="flex flex-col gap-4">
        {slotGroups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-1.5 mb-2">
              {group.label === 'Night' ? (
                <Moon className="w-3.5 h-3.5 text-surface-800/40" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-surface-800/40" />
              )}
              <span className="text-xs font-medium text-surface-800/60">{group.label}</span>
            </div>
            <div className="slot-grid">
              {group.slots.map((slot) => {
                const isSelected = selectedSlots.some((s) => s.id === slot.id)
                const isDisabled = slot.status !== 'available'
                const isBlocked = slot.status === 'blocked'
                return (
                  <button
                    key={slot.id}
                    disabled={isDisabled}
                    title={isBlocked ? slot.blocked_reason ?? 'Blocked' : isDisabled ? 'Already booked' : undefined}
                    onClick={() => toggleSlot(slot)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors',
                      isSelected && 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-300',
                      isDisabled && 'bg-surface-100 text-surface-800/30 border-surface-200 line-through cursor-not-allowed',
                      !isSelected && !isDisabled && 'bg-white text-surface-800 border-surface-200 hover:border-brand-400 hover:bg-brand-50',
                      justUpdated?.has(slot.id) && 'animate-pulse ring-2 ring-amber-400'
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {isBlocked && <Lock className="w-3 h-3 shrink-0" />}
                      {formatTime(slot.start_time)}
                    </span>
                    <span className="opacity-80">{formatPrice(slot.price)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-800/60">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-surface-200 bg-white" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-600" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-3.5 rounded bg-surface-100 border border-surface-200 flex items-center justify-center text-[7px] leading-none line-through text-surface-800/40">
            00
          </span>
          Booked
        </span>
      </div>

      <BookingSummary
        selectedCount={selectedSlots.length}
        totalAmount={totalAmount}
        onBook={() => onBook(selectedSlots, totalAmount)}
        loading={bookingLoading}
      />
    </div>
  )
}
