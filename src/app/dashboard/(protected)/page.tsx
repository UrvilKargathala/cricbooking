'use client'

import { useState } from 'react'
import { Calendar, IndianRupee, TrendingUp, Users, Clock, ArrowUp, ArrowDown } from 'lucide-react'
import { formatPrice, formatTime } from '@/lib/utils'
import { DEMO_OWNER_BOOKINGS, DEMO_VENUES } from '@/lib/demo-data'
import { Badge } from '@/components/ui/Badge'
import { BookingDetailsModal } from '@/components/dashboard/BookingDetailsModal'
import { RevenueAreaChart } from '@/components/dashboard/RevenueAreaChart'
import { OccupancyHeatmap } from '@/components/dashboard/OccupancyHeatmap'
import type { Booking } from '@/types'

const COURTS = DEMO_VENUES.slice(0, 2).flatMap((venue) => venue.courts ?? [])

const activeBookings = DEMO_OWNER_BOOKINGS.filter((b) => b.status !== 'cancelled')
const sortedUniqueDates = Array.from(new Set(activeBookings.map((b) => b.slot?.date).filter((d): d is string => Boolean(d)))).sort()
const latestDate = sortedUniqueDates[sortedUniqueDates.length - 1]
const previousDate = sortedUniqueDates[sortedUniqueDates.length - 2]
const todaysBookings = activeBookings.filter((b) => b.slot?.date === latestDate)
const previousDayBookings = previousDate ? activeBookings.filter((b) => b.slot?.date === previousDate) : []
const todaysRevenue = todaysBookings.reduce((sum, b) => sum + b.amount, 0)
const previousDayRevenue = previousDayBookings.reduce((sum, b) => sum + b.amount, 0)
const monthRevenue = activeBookings.reduce((sum, b) => sum + b.amount, 0)
const uniqueCustomers = new Set(activeBookings.map((b) => b.user?.full_name || b.customer_name)).size

const midpoint = Math.floor(activeBookings.length / 2)
const sortedByDate = [...activeBookings].sort((a, b) => (a.slot?.date ?? '').localeCompare(b.slot?.date ?? ''))
const firstHalf = sortedByDate.slice(0, midpoint)
const secondHalf = sortedByDate.slice(midpoint)
const firstHalfRevenue = firstHalf.reduce((sum, b) => sum + b.amount, 0)
const secondHalfRevenue = secondHalf.reduce((sum, b) => sum + b.amount, 0)
const firstHalfCustomers = new Set(firstHalf.map((b) => b.user?.full_name || b.customer_name))
const newCustomersInSecondHalf = new Set(secondHalf.map((b) => b.user?.full_name || b.customer_name).filter((name) => !firstHalfCustomers.has(name))).size

function pctDelta(current: number, previous: number) {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

const STATS = [
  {
    label: "Today's Bookings", value: String(todaysBookings.length), icon: Calendar, bg: 'bg-blue-50', text: 'text-blue-600',
    delta: pctDelta(todaysBookings.length, previousDayBookings.length), deltaSuffix: 'vs previous day',
  },
  {
    label: "Today's Revenue", value: formatPrice(todaysRevenue), icon: IndianRupee, bg: 'bg-emerald-50', text: 'text-emerald-600',
    delta: pctDelta(todaysRevenue, previousDayRevenue), deltaSuffix: 'vs previous day',
  },
  {
    label: 'This Month', value: formatPrice(monthRevenue), icon: TrendingUp, bg: 'bg-brand-50', text: 'text-brand-600',
    delta: pctDelta(secondHalfRevenue, firstHalfRevenue), deltaSuffix: 'vs earlier period',
  },
  {
    label: 'Total Customers', value: String(uniqueCustomers), icon: Users, bg: 'bg-purple-50', text: 'text-purple-600',
    delta: null, deltaSuffix: `+${newCustomersInSecondHalf} new recently`,
  },
]

const revenueByDate = Object.entries(
  activeBookings.reduce<Record<string, number>>((acc, b) => {
    const date = b.slot?.date ?? 'unknown'
    acc[date] = (acc[date] ?? 0) + b.amount
    return acc
  }, {})
).sort(([a], [b]) => a.localeCompare(b))

export default function DashboardOverviewPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const recentBookings = DEMO_OWNER_BOOKINGS.slice(0, 5)

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-800/60">{stat.label}</p>
                <p className="font-display font-bold text-2xl text-surface-900 mt-1">{stat.value}</p>
                {stat.delta !== null ? (
                  <p className={`flex items-center gap-0.5 text-xs font-medium mt-0.5 ${stat.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(stat.delta)}% {stat.deltaSuffix}
                  </p>
                ) : (
                  <p className="text-xs text-surface-800/40 mt-0.5">{stat.deltaSuffix}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.text}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
        <h2 className="font-display font-semibold text-surface-900 mb-4">Revenue Trend</h2>
        <RevenueAreaChart data={revenueByDate} />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
        <h2 className="font-display font-semibold text-surface-900 mb-4">Weekly Occupancy</h2>
        <OccupancyHeatmap courts={COURTS} />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-semibold text-surface-900">Recent Bookings</h2>
          <a href="/dashboard/bookings" className="text-sm text-brand-600 font-medium hover:underline">
            View All
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-800/50 border-b border-surface-100">
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Court</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {recentBookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="cursor-pointer hover:bg-surface-50"
                >
                  <td className="py-3 font-mono text-xs text-surface-800/70">{booking.booking_code}</td>
                  <td className="py-3 font-medium text-surface-900">
                    {booking.user?.full_name || booking.customer_name || 'Walk-in Customer'}
                  </td>
                  <td className="py-3 text-surface-800/70">{booking.court?.name}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(booking.slot!.start_time)} - {formatTime(booking.slot!.end_time)}
                    </span>
                  </td>
                  <td className="py-3 font-medium">{formatPrice(booking.amount)}</td>
                  <td className="py-3">
                    <Badge variant={booking.source}>{booking.source}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant={booking.status}>{booking.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => alert('Walk-in booking form coming in backend phase.')}
          className="bg-white rounded-xl border border-surface-200 p-5 text-left hover:border-brand-300 transition-colors cursor-pointer"
        >
          <h3 className="font-display font-semibold text-surface-900">Create Walk-in Booking</h3>
          <p className="text-sm text-surface-800/50 mt-1">Manually book a slot for a customer who called or walked in.</p>
        </button>
        <button
          onClick={() => alert('Slot blocking is available on the Slot Management page.')}
          className="bg-white rounded-xl border border-surface-200 p-5 text-left hover:border-brand-300 transition-colors cursor-pointer"
        >
          <h3 className="font-display font-semibold text-surface-900">Block Time Slots</h3>
          <p className="text-sm text-surface-800/50 mt-1">Block slots for maintenance, events, or private bookings.</p>
        </button>
      </div>

      <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </div>
  )
}
