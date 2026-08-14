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
  { label: 'Low', max: 25, className: 'bg-surface-100 text-surface-800/60' },
  { label: 'Medium', max: 50, className: 'bg-brand-200 text-brand-900' },
  { label: 'High', max: 75, className: 'bg-brand-400 text-white' },
  { label: 'Fully Occupied', max: 101, className: 'bg-brand-600 text-white' },
]

function levelFor(pct: number) {
  return LEVELS.find((l) => pct < l.max) ?? LEVELS[LEVELS.length - 1]
}

export function OccupancyHeatmap({ courts }: OccupancyHeatmapProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left font-medium text-surface-800/50 pr-2 whitespace-nowrap">Court</th>
              {DAYS.map((day) => (
                <th key={day.toISOString()} className="font-medium text-surface-800/50 pb-1">
                  {format(day, 'EEE d')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courts.map((court) => (
              <tr key={court.id}>
                <td className="text-surface-800 font-medium whitespace-nowrap pr-2">{court.name}</td>
                {DAYS.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const slots = generateDemoSlots(court.id, dateStr)
                  const bookedCount = slots.filter((s) => s.status === 'booked').length
                  const pct = Math.round((bookedCount / slots.length) * 100)
                  const level = levelFor(pct)
                  return (
                    <td key={dateStr}>
                      <div
                        title={`${court.name} — ${format(day, 'MMM d')}: ${pct}% booked (${level.label})`}
                        className={cn('w-full h-8 rounded-md flex items-center justify-center font-medium', level.className)}
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

      <div className="flex gap-4 mt-3 text-xs text-surface-800/50 flex-wrap">
        {LEVELS.map((level) => (
          <span key={level.label} className="flex items-center gap-1.5">
            <span className={cn('w-3 h-3 rounded', level.className)} />
            {level.label}
          </span>
        ))}
      </div>
    </div>
  )
}
