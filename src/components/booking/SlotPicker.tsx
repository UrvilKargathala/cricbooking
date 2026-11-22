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
  loading?: boolean
  preselectTime?: string | null
  openCounts?: Record<string, number> | null
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

export function SlotPicker({
  courts,
  slots,
  selectedDate,
  onDateChange,
  onSelectionChange,
  justUpdated,
  loading = false,
  preselectTime = null,
  openCounts = null,
}: SlotPickerProps) {
  const [activeCourt, setActiveCourt] = useState(courts[0]?.id ?? '')
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([])

  useEffect(() => {
    setSelectedSlots([])
  }, [activeCourt, selectedDate])

  const selectedCourt = courts.find((c) => c.id === activeCourt) || courts[0]

  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
  const isPast = (slot: Slot) => slot.date < todayKey || (slot.date === todayKey && slot.start_time <= nowTime)
  const courtSlots = slots.filter((s) => s.court_id === activeCourt && !isPast(s))
  const [preselectDone, setPreselectDone] = useState(false)

  useEffect(() => {
    if (preselectDone || !preselectTime || loading || slots.length === 0) return
    const match = slots.find((slot) => slot.status === 'available' && slot.start_time.startsWith(preselectTime))
    setPreselectDone(true)
    if (!match) return
    if (match.court_id !== activeCourt) setActiveCourt(match.court_id)
    setTimeout(() => setSelectedSlots([match]), 0)
  }, [preselectDone, preselectTime, loading, slots, activeCourt])

  const slotGroups = groupByTimeOfDay(courtSlots)

  useEffect(() => {
    onSelectionChange(selectedSlots, selectedCourt ?? null)
  }, [selectedSlots, selectedCourt, onSelectionChange])

  const [selectionNote, setSelectionNote] = useState<string | null>(null)

  useEffect(() => {
    if (!selectionNote) return
    const timer = window.setTimeout(() => setSelectionNote(null), 4000)
    return () => window.clearTimeout(timer)
  }, [selectionNote])

  const toggleSlot = (slot: Slot) => {
    if (slot.status !== 'available') return
    const current = [...selectedSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))
    const index = current.findIndex((s) => s.id === slot.id)

    if (index !== -1) {
      if (index === 0 || index === current.length - 1) {
        setSelectedSlots(current.filter((s) => s.id !== slot.id))
      } else {
        setSelectedSlots(current.slice(0, index))
        setSelectionNote('Hours in one booking must be back-to-back, so the later hours were removed too.')
      }
      return
    }

    if (current.length === 0) {
      setSelectedSlots([slot])
      return
    }

    const first = current[0]
    const last = current[current.length - 1]
    if (slot.start_time === last.end_time) {
      setSelectedSlots([...current, slot])
    } else if (slot.end_time === first.start_time) {
      setSelectedSlots([slot, ...current])
    } else {
      setSelectedSlots([slot])
      setSelectionNote('Hours in one booking must be back-to-back, so we started a new selection from this time.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Date Selector */}
      <div>
        <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} openCounts={openCounts} />
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
                <span className={`text-[12px] ${isSelected ? 'text-[#FBBF24]' : 'text-[#6c6c6c]'}`}>
                  {formatPrice(court.price_per_slot)}/hr
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Time Groups & Slot Grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5" aria-busy="true" aria-label="Loading slots">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-[58px] animate-pulse rounded-[12px] bg-white/70" />
          ))}
        </div>
      ) : slotGroups.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[#cfd6db] bg-white px-5 py-8 text-center">
          <p className="text-[15px] font-medium text-black">No slots open on this date</p>
          <p className="mt-1 text-[13px] text-[#50555c]">Try another day above{courts.length > 1 ? ' or switch court' : ''}.</p>
        </div>
      ) : (
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

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
              {group.slots.map((slot) => {
                const isSelected = selectedSlots.some((s) => s.id === slot.id)
                const isBooked = slot.status !== 'available'
                const flash = justUpdated?.has(slot.id)

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isBooked}
                    aria-pressed={isSelected}
                    aria-label={`${formatTime(slot.start_time)}, ${isBooked ? 'booked' : `${formatPrice(slot.price)}${isSelected ? ', selected' : ''}`}`}
                    onClick={() => toggleSlot(slot)}
                    className={cn(
                      'h-[58px] w-full min-w-0 rounded-[12px] flex flex-col items-center justify-center gap-0.5 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#042644] focus-visible:ring-offset-2',
                      isSelected && 'bg-[#042644] text-white ring-2 ring-[#F59E0B] shadow-sm',
                      !isSelected && !isBooked && 'bg-white border-2 border-[#F59E0B] text-black hover:bg-[#FEF7E6]',
                      isBooked && 'slot-booked text-[#8a939a] cursor-not-allowed border border-[#dde2e6]',
                      flash && 'animate-pulse'
                    )}
                  >
                    <span className="text-[14px] font-semibold">
                      {formatTime(slot.start_time).replace(':00', '')}
                    </span>
                    <span
                      className={cn(
                        'text-[11px]',
                        isSelected ? 'text-[#FBBF24] font-medium' : isBooked ? 'font-medium uppercase tracking-wide' : 'text-[#50555c]'
                      )}
                    >
                      {isBooked ? 'Booked' : formatPrice(slot.price)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      )}

      {selectionNote && (
        <p role="status" className="rounded-xl bg-[#FEF3C7] px-4 py-2.5 text-[13px] text-[#92400E]">
          {selectionNote}
        </p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#404449] pt-3 border-t border-[#dfe3e6]">
        <div className="flex items-center gap-1.5">
          <span className="size-4 rounded-[5px] bg-white border-2 border-[#F59E0B]" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-4 rounded-[5px] bg-[#042644] ring-2 ring-[#F59E0B]" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="slot-booked size-4 rounded-[5px] border border-[#dde2e6]" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  )
}
