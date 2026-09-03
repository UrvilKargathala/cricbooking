'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Lock, Check } from 'lucide-react'
import { cn, formatPrice, formatTime, SURFACE_LABELS } from '@/lib/utils'
import { DateSelector } from './DateSelector'
import type { Court, Slot } from '@/types'

interface SlotPickerProps {
  courts: Court[]
  slots: Slot[]
  selectedDate: string
  onDateChange: (date: string) => void
  onSelectionChange: (selectedSlots: Slot[], court: Court | null) => void
  justUpdated?: Set<string>
}

const TIME_GROUPS = [
  { label: 'Morning', startHour: 0, endHour: 12 },
  { label: 'Afternoon', startHour: 12, endHour: 17 },
  { label: 'Evening', startHour: 17, endHour: 24 },
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

export function SlotPicker({ courts, slots, selectedDate, onDateChange, onSelectionChange, justUpdated }: SlotPickerProps) {
  const [activeCourt, setActiveCourt] = useState(courts[0]?.id ?? '')
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([])

  const cheapestCourtId = courts.length > 1
    ? courts.reduce((min, c) => (c.price_per_slot < min.price_per_slot ? c : min), courts[0]).id
    : null

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

  useEffect(() => {
    onSelectionChange(selectedSlots, courts.find((c) => c.id === activeCourt) ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlots, activeCourt])

  const toggleSlot = (slot: Slot) => {
    if (slot.status !== 'available') return
    setSelectedSlots((prev) =>
      prev.some((s) => s.id === slot.id)
        ? prev.filter((s) => s.id !== slot.id)
        : [...prev, slot]
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium text-surface-800/50 uppercase tracking-wide mb-2">Date</p>
        <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} />
      </div>

      {courts.length > 1 && (
        <div>
          <p className="text-xs font-medium text-surface-800/50 uppercase tracking-wide mb-2">Court</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {courts.map((court) => {
              const active = activeCourt === court.id
              return (
                <button
                  key={court.id}
                  onClick={() => setActiveCourt(court.id)}
                  className={cn(
                    'relative text-left rounded-xl border p-3 transition-colors',
                    active ? 'border-brand-600 bg-brand-50' : 'border-surface-200 bg-white hover:border-brand-300'
                  )}
                >
                  {active && (
                    <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <p className="text-sm font-medium text-surface-900">{court.name}</p>
                  <p className="text-xs text-surface-800/50 mt-0.5">{SURFACE_LABELS[court.surface] ?? court.surface}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {court.id === cheapestCourtId && (
                      <span className="text-[10px] font-medium text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">Best value</span>
                    )}
                    <span className="text-xs font-semibold text-surface-900">{formatPrice(court.price_per_slot)}/hr</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {slotGroups.length === 0 && (
          <p className="text-sm text-surface-800/50">No slots available for this date.</p>
        )}
        {slotGroups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-1.5 mb-2">
              {group.label === 'Evening' ? (
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

      <div className="flex items-center gap-4 text-xs text-surface-800/60 border-t border-surface-100 pt-4">
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
    </div>
  )
}
