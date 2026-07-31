'use client'

import { useEffect, useState } from 'react'
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
}

export function SlotPicker({ courts, slots, selectedDate, onDateChange, onBook }: SlotPickerProps) {
  const [activeCourt, setActiveCourt] = useState(courts[0]?.id ?? '')
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([])

  useEffect(() => {
    setSelectedSlots([])
  }, [activeCourt, selectedDate])

  const courtSlots = slots.filter((s) => s.court_id === activeCourt)

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
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeCourt === court.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 text-surface-800 hover:bg-surface-200'
              )}
            >
              {court.name}
            </button>
          ))}
        </div>
      )}

      <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} />

      <div className="slot-grid">
        {courtSlots.map((slot) => {
          const isSelected = selectedSlots.some((s) => s.id === slot.id)
          const isDisabled = slot.status !== 'available'
          return (
            <button
              key={slot.id}
              disabled={isDisabled}
              onClick={() => toggleSlot(slot)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors',
                isSelected && 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-300',
                isDisabled && 'bg-surface-100 text-surface-800/30 border-surface-200 line-through cursor-not-allowed',
                !isSelected && !isDisabled && 'bg-white text-surface-800 border-surface-200 hover:border-brand-400 hover:bg-brand-50'
              )}
            >
              <span>{formatTime(slot.start_time)}</span>
              <span className="opacity-80">{formatPrice(slot.price)}</span>
            </button>
          )
        })}
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
          <span className="w-3 h-3 rounded bg-surface-100 border border-surface-200" />
          Booked
        </span>
      </div>

      <BookingSummary
        selectedCount={selectedSlots.length}
        totalAmount={totalAmount}
        onBook={() => onBook(selectedSlots, totalAmount)}
      />
    </div>
  )
}
