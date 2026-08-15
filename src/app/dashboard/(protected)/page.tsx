'use client'

import { useState } from 'react'
import {
  Calendar, IndianRupee, TrendingUp, Users, Clock,
  ArrowUp, ArrowDown, CalendarCheck, Percent,
} from 'lucide-react'
import { formatPrice, formatTime } from '@/lib/utils'
import { DEMO_OWNER_BOOKINGS, DEMO_VENUES } from '@/lib/demo-data'
import { Badge } from '@/components/ui/Badge'
import { BookingDetailsModal } from '@/components/dashboard/BookingDetailsModal'
import { RevenueAreaChart } from '@/components/dashboard/RevenueAreaChart'
import { BookingsBarChart } from '@/components/dashboard/BookingsBarChart'
import { PaymentDonutChart } from '@/components/dashboard/PaymentDonutChart'
import { SourceDonutChart } from '@/components/dashboard/SourceDonutChart'
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

const occupancyRate = Math.round((activeBookings.length / (activeBookings.length + 4)) * 100)

function pctDelta(current: number, previous: number) {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

const STATS = [
  {
    label: "Today's Bookings", value: String(todaysBookings.length), icon: Calendar, bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100',
    delta: pctDelta(todaysBookings.length, previousDayBookings.length), deltaSuffix: 'vs yesterday',
  },
  {
    label: "Today's Revenue", value: formatPrice(todaysRevenue), icon: IndianRupee, bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100',
    delta: pctDelta(todaysRevenue, previousDayRevenue), deltaSuffix: 'vs yesterday',
  },
  {
    label: 'Monthly Revenue', value: formatPrice(monthRevenue), icon: TrendingUp, bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100',
    delta: pctDelta(secondHalfRevenue, firstHalfRevenue), deltaSuffix: 'growth',
  },
  {
    label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: Percent, bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100',
    delta: null, deltaSuffix: `${activeBookings.length} of ${activeBookings.length + 4} slots filled`,
  },
]

const revenueChartData = Object.entries(
  activeBookings.reduce<Record<string, number>>((acc, b) => {
    const date = b.slot?.date ?? 'unknown'
    acc[date] = (acc[date] ?? 0) + b.amount
    return acc
  }, {})
).sort(([a], [b]) => a.localeCompare(b)).map(([date, revenue]) => ({
  date: date.slice(5),
  revenue,
}))

const bookingsChartData = Object.entries(
  activeBookings.reduce<Record<string, number>>((acc, b) => {
    const date = b.slot?.date ?? 'unknown'
    acc[date] = (acc[date] ?? 0) + 1
    return acc
  }, {})
).sort(([a], [b]) => a.localeCompare(b)).map(([date, bookings]) => ({
  date: date.slice(5),
  bookings,
}))

const paidAmount = DEMO_OWNER_BOOKINGS.filter((b) => b.payment_status === 'paid' && b.status !== 'cancelled').reduce((s, b) => s + b.amount, 0)
const pendingAmount = DEMO_OWNER_BOOKINGS.filter((b) => b.payment_status === 'pending').reduce((s, b) => s + b.amount, 0)
const refundedAmount = DEMO_OWNER_BOOKINGS.filter((b) => b.payment_status === 'refunded').reduce((s, b) => s + b.amount, 0)
const paymentData = [
  { name: 'Paid', value: paidAmount, color: '#10b981' },
  { name: 'Pending', value: pendingAmount, color: '#f59e0b' },
  { name: 'Refunded', value: refundedAmount, color: '#ef4444' },
].filter((d) => d.value > 0)

const onlineCount = activeBookings.filter((b) => b.source === 'online').length
const walkinCount = activeBookings.filter((b) => b.source === 'walkin').length
const phoneCount = activeBookings.filter((b) => b.source === 'phone').length
const sourceData = [
  { name: 'Online', value: onlineCount, color: '#3b82f6' },
  { name: 'Walk-in', value: walkinCount, color: '#8b5cf6' },
  { name: 'Phone', value: phoneCount, color: '#f59e0b' },
].filter((d) => d.value > 0)

export default function DashboardOverviewPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const recentBookings = DEMO_OWNER_BOOKINGS.slice(0, 6)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-surface-900">Dashboard Overview</h1>
          <p className="text-sm text-surface-500 mt-0.5">Here&apos;s what&apos;s happening with your venues today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <CalendarCheck className="w-4 h-4" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-surface-500">{stat.label}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.text}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="font-display font-bold text-2xl text-surface-900">{stat.value}</p>
            {stat.delta !== null ? (
              <p className={`flex items-center gap-0.5 text-xs font-medium mt-1 ${stat.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stat.delta)}% {stat.deltaSuffix}
              </p>
            ) : (
              <p className="text-xs text-surface-400 mt-1">{stat.deltaSuffix}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">Revenue Trend</h2>
            <span className="text-xs font-medium text-surface-400 bg-surface-100 px-2.5 py-1 rounded-lg">This Month</span>
          </div>
          <RevenueAreaChart data={revenueChartData} />
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">Daily Bookings</h2>
            <span className="text-xs font-medium text-surface-400 bg-surface-100 px-2.5 py-1 rounded-lg">This Month</span>
          </div>
          <BookingsBarChart data={bookingsChartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h2 className="font-display font-semibold text-surface-900 mb-4">Payment Breakdown</h2>
          <PaymentDonutChart data={paymentData} total={paidAmount + pendingAmount + refundedAmount} />
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h2 className="font-display font-semibold text-surface-900 mb-4">Booking Sources</h2>
          <SourceDonutChart data={sourceData} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-surface-900">Court Occupancy — Next 7 Days</h2>
        </div>
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
              <tr className="text-left text-surface-500 border-b border-surface-100">
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Court</th>
                <th className="pb-3 font-medium">Date & Time</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {recentBookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="cursor-pointer hover:bg-surface-50 transition-colors"
                >
                  <td className="py-3.5 font-mono text-xs text-surface-500">{booking.booking_code}</td>
                  <td className="py-3.5">
                    <p className="font-medium text-surface-900">
                      {booking.user?.full_name || booking.customer_name || 'Walk-in'}
                    </p>
                  </td>
                  <td className="py-3.5 text-surface-600">{booking.court?.name}</td>
                  <td className="py-3.5">
                    <p className="text-surface-900">{booking.slot?.date?.slice(5)}</p>
                    <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(booking.slot!.start_time)} – {formatTime(booking.slot!.end_time)}
                    </p>
                  </td>
                  <td className="py-3.5 font-semibold text-surface-900">{formatPrice(booking.amount)}</td>
                  <td className="py-3.5">
                    <Badge variant={booking.source}>{booking.source}</Badge>
                  </td>
                  <td className="py-3.5">
                    <Badge variant={booking.payment_status as 'paid' | 'pending' | 'refunded'}>{booking.payment_status}</Badge>
                  </td>
                  <td className="py-3.5">
                    <Badge variant={booking.status}>{booking.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </div>
  )
}
