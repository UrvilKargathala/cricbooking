'use client'

import { useEffect, useRef, useState } from 'react'
import { addDays, format, isSameMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
  openCounts?: Record<string, number> | null
}

export function DateSelector({ selectedDate, onDateChange, openCounts = null }: DateSelectorProps) {
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const monthLabel = isSameMonth(days[0], days[days.length - 1])
    ? format(days[0], 'MMMM yyyy')
    : `${format(days[0], 'MMMM')} - ${format(days[days.length - 1], 'MMMM yyyy')}`

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[13px] font-medium text-[#50555c]">{monthLabel}</span>

      <div className="relative flex items-center">
        {canScrollLeft && (
          <button
            onClick={() => scrollBy(-140)}
            aria-label="Scroll to earlier dates"
            className="hidden sm:flex absolute left-0 z-10 size-8 items-center justify-center rounded-full bg-white border border-[#e3e5e8] shadow-sm hover:bg-[#f4f6f8]"
          >
            <ChevronLeft className="size-4 text-black" />
          </button>
        )}

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth px-1 py-1"
          >
            {days.map((day, index) => {
              const value = format(day, 'yyyy-MM-dd')
              const isSelected = value === selectedDate
              const count = openCounts ? openCounts[value] ?? 0 : null
              const isEmpty = count === 0
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onDateChange(value)}
                  aria-pressed={isSelected}
                  aria-label={`${format(day, 'EEEE d MMMM')}${count === null ? '' : `, ${count ? `${count} open slots` : 'no open slots'}`}`}
                  className={cn(
                    'shrink-0 flex flex-col items-center justify-center w-[70px] py-2.5 rounded-[14px] text-sm transition-all select-none',
                    isSelected
                      ? 'bg-[#042644] text-white shadow-sm'
                      : isEmpty
                      ? 'bg-[#f4f6f8] text-[#9aa1a8] hover:bg-[#eef1f4]'
                      : 'bg-white text-black border border-[#e3e5e8] hover:border-[#042644]/40'
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px]',
                      isSelected ? 'text-[#FBBF24] font-medium' : isEmpty ? 'text-[#9aa1a8]' : 'text-[#6c6c6c]'
                    )}
                  >
                    {index === 0 ? 'Today' : format(day, 'EEE')}
                  </span>
                  <span className="font-semibold text-[17px]">{format(day, 'd')}</span>
                  <span
                    className={cn(
                      'text-[11px]',
                      count === null
                        ? isSelected ? 'text-white/80' : 'text-[#6c6c6c]'
                        : isSelected
                        ? 'text-white/85 font-medium'
                        : isEmpty
                        ? 'text-[#9aa1a8]'
                        : 'text-[#92400E] font-medium'
                    )}
                  >
                    {count === null ? format(day, 'MMM') : count ? `${count} open` : 'No slots'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollBy(140)}
            aria-label="Scroll to later dates"
            className="hidden sm:flex absolute right-0 z-10 size-8 items-center justify-center rounded-full bg-white border border-[#e3e5e8] shadow-sm hover:bg-[#f4f6f8]"
          >
            <ChevronRight className="size-4 text-black" />
          </button>
        )}
      </div>
    </div>
  )
}
