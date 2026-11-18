'use client'

import { useEffect, useRef, useState } from 'react'
import { addDays, format, isSameMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
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
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onDateChange(value)}
                  className={cn(
                    'shrink-0 flex flex-col items-center justify-center w-16 py-2.5 rounded-[14px] text-sm transition-all select-none',
                    isSelected
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-[#f4f6f8] text-black hover:bg-[#eef1f4]'
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px]',
                      isSelected ? 'text-[#c9f13e] font-medium' : 'text-[#6c6c6c]'
                    )}
                  >
                    {index === 0 ? 'Today' : format(day, 'EEE')}
                  </span>
                  <span className="font-semibold text-[17px]">{format(day, 'd')}</span>
                  <span
                    className={cn(
                      'text-[11px]',
                      isSelected ? 'text-white/80' : 'text-[#6c6c6c]'
                    )}
                  >
                    {format(day, 'MMM')}
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
