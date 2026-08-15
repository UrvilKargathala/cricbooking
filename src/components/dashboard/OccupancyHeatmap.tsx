'use client'

import { addDays, format } from 'date-fns'
import { generateDemoSlots } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import type { Court } from '@/types'

interface OccupancyHeatmapProps {
  courts: Court[]
}

const DAYS = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

const LEVELS = [
  { label: 'Low', max: 25, bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { label: 'Medium', max: 50, bg: 'bg-amber-100', text: 'text-amber-800' },
  { label: 'High', max: 75, bg: 'bg-orange-200', text: 'text-orange-900' },
  { label: 'Full', max: 101, bg: 'bg-brand-500', text: 'text-white' },
]

function levelFor(pct: number) {
  return LEVELS.find((l) => pct < l.max) ?? LEVELS[LEVELS.length - 1]
}

export function OccupancyHeatmap({ courts }: OccupancyHeatmapProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-1.5">
          <thead>
            <tr>
              <th className="text-left font-medium text-surface-800/50 pr-2 whitespace-nowrap pb-2">Court</th>
              {DAYS.map((day) => (
                <th key={day.toISOString()} className="font-medium text-surface-800/50 pb-2 text-center">
                  <span className="block">{format(day, 'EEE')}</span>
                  <span className="block text-surface-900 font-semibold">{format(day, 'd')}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courts.map((court) => (
              <tr key={court.id}>
                <td className="text-sm text-surface-800 font-medium whitespace-nowrap pr-3">{court.name}</td>
                {DAYS.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const slots = generateDemoSlots(court.id, dateStr)
                  const bookedCount = slots.filter((s) => s.status === 'booked').length
                  const pct = Math.round((bookedCount / slots.length) * 100)
                  const level = levelFor(pct)
                  return (
                    <td key={dateStr}>
                      <div
                        title={`${court.name} — ${format(day, 'MMM d')}: ${pct}% booked`}
                        className={cn('h-10 rounded-lg flex items-center justify-center font-semibold text-xs', level.bg, level.text)}
                      >
                        {pct}%
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-5 mt-3 text-xs text-surface-800/50 flex-wrap">
        {LEVELS.map((level) => (
          <span key={level.label} className="flex items-center gap-1.5">
            <span className={cn('w-3 h-3 rounded-sm', level.bg)} />
            {level.label}
          </span>
        ))}
      </div>
    </div>
  )
}
