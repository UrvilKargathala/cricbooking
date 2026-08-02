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
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-surface-800/60">{monthLabel}</span>

      <div className="relative flex items-center">
        {canScrollLeft && (
          <button
            onClick={() => scrollBy(-140)}
            aria-label="Scroll to earlier dates"
            className="hidden sm:flex absolute left-0 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-surface-200 shadow-sm hover:bg-surface-100"
          >
            <ChevronLeft className="w-4 h-4 text-surface-800" />
          </button>
        )}

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth"
          >
            {days.map((day, index) => {
              const value = format(day, 'yyyy-MM-dd')
              const isSelected = value === selectedDate
              return (
                <button
                  key={value}
                  onClick={() => onDateChange(value)}
                  className={cn(
                    'shrink-0 flex flex-col items-center justify-center w-16 py-2 rounded-lg border text-sm transition-colors',
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-surface-800 border-surface-200 hover:border-brand-400'
                  )}
                >
                  <span className="text-xs opacity-70">{index === 0 ? 'Today' : format(day, 'EEE')}</span>
                  <span className="font-display font-semibold text-lg">{format(day, 'd')}</span>
                  <span className="text-xs opacity-70">{format(day, 'MMM')}</span>
                </button>
              )
            })}
          </div>

          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-white to-transparent" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-white to-transparent" />
          )}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollBy(140)}
            aria-label="Scroll to later dates"
            className="hidden sm:flex absolute right-0 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-surface-200 shadow-sm hover:bg-surface-100"
          >
            <ChevronRight className="w-4 h-4 text-surface-800" />
          </button>
        )}
      </div>
    </div>
  )
}
