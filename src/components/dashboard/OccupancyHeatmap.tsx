'use client'

import { useEffect, useState } from 'react'
import { addDays, format } from 'date-fns'
import { fetchSlots } from '@/lib/supabase-queries'
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

type HeatmapData = Record<string, Record<string, number>>

export function OccupancyHeatmap({ courts }: OccupancyHeatmapProps) {
  const [data, setData] = useState<HeatmapData>({})

  useEffect(() => {
    const load = async () => {
      const queries = courts.flatMap((court) =>
        DAYS.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          return fetchSlots(court.id, dateStr).then((slots) => ({
            courtId: court.id,
            dateStr,
            total: slots.length,
            booked: slots.filter((s) => s.status === 'booked').length,
          }))
        })
      )
      const results = await Promise.all(queries)
      const result: HeatmapData = {}
      for (const r of results) {
        if (!result[r.courtId]) result[r.courtId] = {}
        result[r.courtId][r.dateStr] = r.total > 0 ? Math.round((r.booked / r.total) * 100) : 0
      }
      setData(result)
    }
    if (courts.length > 0) load()
  }, [courts])

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
                  const pct = data[court.id]?.[dateStr] ?? 0
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
