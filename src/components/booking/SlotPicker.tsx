'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn, formatPrice, formatTime } from '@/lib/utils'
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

// Generate fallback mock slots if database has none
function generateMockSlots(courtId: string, date: string, price: number): Slot[] {
  const times = ['06:00:00', '07:00:00', '08:00:00', '09:00:00', '16:00:00', '17:00:00', '18:00:00', '19:00:00', '20:00:00', '21:00:00', '22:00:00']
  return times.map((st, i) => {
    const endH = Number(st.slice(0, 2)) + 1
    const et = `${endH < 10 ? '0' : ''}${endH}:00:00`
    const isBooked = i === 1 || i === 7 // mock booked
    return {
      id: `slot_${courtId}_${date}_${i}`,
      court_id: courtId,
      date,
      start_time: st,
      end_time: et,
      price,
      status: isBooked ? 'booked' : 'available',
      blocked_reason: null,
      created_at: new Date().toISOString(),
    }
  })
}

export function SlotPicker({
  courts,
  slots,
  selectedDate,
  onDateChange,
  onSelectionChange,
}: SlotPickerProps) {
  const [activeCourt, setActiveCourt] = useState(courts[0]?.id ?? '')
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([])

  useEffect(() => {
    setSelectedSlots([])
  }, [activeCourt, selectedDate])

  const selectedCourt = courts.find((c) => c.id === activeCourt) || courts[0]

  // Use provided slots or fallback mock slots
  const courtSlotsRaw = slots.filter((s) => s.court_id === activeCourt)
  const courtSlots =
    courtSlotsRaw.length > 0
      ? courtSlotsRaw
      : selectedCourt
      ? generateMockSlots(selectedCourt.id, selectedDate, selectedCourt.price_per_slot)
      : []

  const slotGroups = groupByTimeOfDay(courtSlots)

  useEffect(() => {
    onSelectionChange(selectedSlots, selectedCourt ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlots, selectedCourt])

  const toggleSlot = (slot: Slot) => {
    if (slot.status !== 'available') return

    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.id === slot.id)
      if (exists) {
        return prev.filter((s) => s.id !== slot.id)
      } else {
        return [...prev, slot].sort((a, b) => a.start_time.localeCompare(b.start_time))
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Date Selector */}
      <div>
        <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} />
      </div>

      {/* Court Selector Pills */}
      {courts.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {courts.map((court) => {
            const isSelected = court.id === activeCourt
            return (
              <button
                key={court.id}
                type="button"
                onClick={() => setActiveCourt(court.id)}
                className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-[#f4f6f8] text-black hover:bg-[#eef1f4]'
                }`}
              >
                <span>{court.name}</span>
                <span className={`text-[12px] ${isSelected ? 'text-[#c9f13e]' : 'text-[#6c6c6c]'}`}>
                  {formatPrice(court.price_per_slot)}/hr
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Time Groups & Slot Grid */}
      <div className="flex flex-col gap-6">
        {slotGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#50555c]">
              {group.label === 'Evening' ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
              <span>{group.label}</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {group.slots.map((slot) => {
                const isSelected = selectedSlots.some((s) => s.id === slot.id)
                const isBooked = slot.status !== 'available'

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isBooked}
                    onClick={() => toggleSlot(slot)}
                    className={cn(
                      'h-[58px] w-[92px] rounded-[12px] flex flex-col items-center justify-center gap-0.5 transition-all select-none',
                      isSelected &&
                        'bg-black text-white shadow-sm',
                      !isSelected &&
                        !isBooked &&
                        'bg-white border border-[#e3e5e8] text-black hover:border-black',
                      isBooked &&
                        'bg-[#f4f6f8] text-[#b5b5b5] cursor-not-allowed border border-transparent'
                    )}
                  >
                    <span
                      className={cn(
                        'text-[14px] font-medium',
                        isBooked && 'line-through'
                      )}
                    >
                      {formatTime(slot.start_time).replace(':00', '')}
                    </span>
                    <span
                      className={cn(
                        'text-[11px]',
                        isSelected ? 'text-[#c9f13e] font-medium' : 'text-[#6c6c6c]'
                      )}
                    >
                      {formatPrice(slot.price)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[12px] text-[#6c6c6c] pt-2 border-t border-[#e3e5e8]">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-md bg-white border border-[#e3e5e8]" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-md bg-black" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-md bg-[#f4f6f8]" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  )
}
