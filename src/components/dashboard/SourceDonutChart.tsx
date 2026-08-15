'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface SourceDonutChartProps {
  data: { name: string; value: number; color: string }[]
}

export function SourceDonutChart({ data }: SourceDonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 13 }}
            formatter={(value) => [`${value} bookings`]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 flex-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-surface-800">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="text-sm text-surface-600">
              {item.value} <span className="text-surface-400">({Math.round((item.value / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
