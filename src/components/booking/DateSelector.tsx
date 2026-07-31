'use client'

import { addDays, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
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
            <span className="text-xs opacity-70">{format(day, 'EEE')}</span>
            <span className="font-display font-semibold text-lg">{format(day, 'd')}</span>
            <span className="text-xs opacity-70">{format(day, 'MMM')}</span>
          </button>
        )
      })}
    </div>
  )
}
