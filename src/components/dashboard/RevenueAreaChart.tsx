'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatPrice } from '@/lib/utils'

interface RevenueAreaChartProps {
  data: { date: string; revenue: number }[]
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d8ad7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1d8ad7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#737373' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#737373' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          width={50}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 13 }}
          formatter={(value) => [formatPrice(value as number), 'Revenue']}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#1d8ad7"
          strokeWidth={2.5}
          fill="url(#revenueGrad)"
          dot={{ r: 4, fill: '#1d8ad7', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, fill: '#1d8ad7', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
