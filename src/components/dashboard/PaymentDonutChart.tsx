'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatPrice } from '@/lib/utils'

interface PaymentDonutChartProps {
  data: { name: string; value: number; color: string }[]
  total: number
}

export function PaymentDonutChart({ data, total }: PaymentDonutChartProps) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
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
            formatter={(value) => [formatPrice(value as number)]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2.5 flex-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-surface-800">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="text-sm font-semibold text-surface-900">{formatPrice(item.value)}</span>
          </div>
        ))}
        <div className="border-t border-surface-100 pt-2 flex items-center justify-between">
          <span className="text-sm font-medium text-surface-600">Total</span>
          <span className="text-sm font-bold text-surface-900">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
