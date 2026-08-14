'use client'

import { useId } from 'react'
import { formatPrice } from '@/lib/utils'

interface RevenueAreaChartProps {
  data: [string, number][]
}

const WIDTH = 100
const HEIGHT = 40
const TOP_PAD = 4
const BASELINE = HEIGHT - 4

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  const gradientId = useId()
  const max = Math.max(...data.map(([, amount]) => amount), 1)

  const points = data.map(([date, amount], i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * WIDTH : WIDTH / 2
    const y = BASELINE - (amount / max) * (BASELINE - TOP_PAD)
    return { x, y, date, amount }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${BASELINE} L ${points[0].x} ${BASELINE} Z`
    : ''

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="w-full h-32">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
        {linePath && (
          <path d={linePath} fill="none" stroke="#ea580c" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        )}

        {points.map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r="1.4" fill="#ea580c" vectorEffect="non-scaling-stroke">
            <title>{`${p.date}: ${formatPrice(p.amount)}`}</title>
          </circle>
        ))}
      </svg>

      <div className="flex justify-between mt-1.5">
        {data.map(([date]) => (
          <span key={date} className="text-[10px] text-surface-800/50 whitespace-nowrap">
            {date.slice(5)}
          </span>
        ))}
      </div>
    </div>
  )
}
