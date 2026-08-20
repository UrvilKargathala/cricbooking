'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BookingsBarChartProps {
  data: { date: string; bookings: number }[]
}

export function BookingsBarChart({ data }: BookingsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
          allowDecimals={false}
          width={30}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 13 }}
          formatter={(value) => [value, 'Bookings']}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Bar
          dataKey="bookings"
          fill="#3ea2ea"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
