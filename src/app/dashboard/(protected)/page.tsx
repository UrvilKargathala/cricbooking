'use client'

import { useEffect, useState } from 'react'
import {
  Calendar, IndianRupee, TrendingUp, Clock,
  ArrowUp, ArrowDown, CalendarCheck, Percent,
} from 'lucide-react'
import { formatPrice, formatTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { fetchOwnerBookings, fetchOwnerVenues } from '@/lib/supabase-queries'
import { Badge } from '@/components/ui/Badge'
import { BookingDetailsModal } from '@/components/dashboard/BookingDetailsModal'
import { RevenueAreaChart } from '@/components/dashboard/RevenueAreaChart'
import { BookingsBarChart } from '@/components/dashboard/BookingsBarChart'
import { PaymentDonutChart } from '@/components/dashboard/PaymentDonutChart'
import { SourceDonutChart } from '@/components/dashboard/SourceDonutChart'
import { OccupancyHeatmap } from '@/components/dashboard/OccupancyHeatmap'
import { useToastStore } from '@/store/useToastStore'
import type { Booking, Court } from '@/types'

export default function DashboardOverviewPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [venueIds, setVenueIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const showToast = useToastStore((s) => s.showToast)

  const fetchDashboardData = async (userId: string) => {
    const [b, v] = await Promise.all([
      fetchOwnerBookings(userId),
      fetchOwnerVenues(userId),
    ])
    setBookings(b)
    setCourts(v.flatMap((venue) => venue.courts ?? []))
    setVenueIds(v.map((venue) => venue.id))
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setOwnerId(user.id)
        await fetchDashboardData(user.id)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!ownerId || venueIds.length === 0) return
    const supabase = createClient()
    const channel = supabase
      .channel('owner-dashboard-bookings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          if (venueIds.includes(payload.new.venue_id)) {
            fetchDashboardData(ownerId)
            showToast('New booking received!', 'success')
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload) => {
          if (venueIds.includes(payload.new.venue_id)) {
            fetchDashboardData(ownerId)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [ownerId, venueIds, showToast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const activeBookings = bookings.filter((b) => b.status !== 'cancelled')
  const today = new Date().toISOString().split('T')[0]
  const todaysBookings = activeBookings.filter((b) => b.slot?.date === today)
  const todaysRevenue = todaysBookings.reduce((sum, b) => sum + b.amount, 0)
  const monthRevenue = activeBookings.reduce((sum, b) => sum + b.amount, 0)
  const occupancyRate = activeBookings.length > 0
    ? Math.round((activeBookings.length / (activeBookings.length + 4)) * 100)
    : 0

  const STATS = [
    {
      label: "Today's Bookings", value: String(todaysBookings.length), icon: Calendar,
      bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100',
      delta: null, deltaSuffix: 'today',
    },
    {
      label: "Today's Revenue", value: formatPrice(todaysRevenue), icon: IndianRupee,
      bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100',
      delta: null, deltaSuffix: 'today',
    },
    {
      label: 'Total Revenue', value: formatPrice(monthRevenue), icon: TrendingUp,
      bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100',
      delta: null, deltaSuffix: 'all time',
    },
    {
      label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: Percent,
      bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100',
      delta: null, deltaSuffix: `${activeBookings.length} bookings`,
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
  ).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({
    date: date.slice(5),
    bookings: count,
  }))

  const paidAmount = bookings.filter((b) => b.payment_status !== 'pending' && b.status !== 'cancelled').reduce((s, b) => s + b.amount, 0)
  const pendingAmount = bookings.filter((b) => b.payment_status === 'pending').reduce((s, b) => s + b.amount, 0)
  const refundedAmount = bookings.filter((b) => b.payment_status === 'refunded').reduce((s, b) => s + b.amount, 0)
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

  const recentBookings = bookings.slice(0, 6)

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

      {revenueChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-surface-900">Revenue Trend</h2>
            </div>
            <RevenueAreaChart data={revenueChartData} />
          </div>

          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-surface-900">Daily Bookings</h2>
            </div>
            <BookingsBarChart data={bookingsChartData} />
          </div>
        </div>
      )}

      {(paymentData.length > 0 || sourceData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {paymentData.length > 0 && (
            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h2 className="font-display font-semibold text-surface-900 mb-4">Payment Breakdown</h2>
              <PaymentDonutChart data={paymentData} total={paidAmount + pendingAmount + refundedAmount} />
            </div>
          )}

          {sourceData.length > 0 && (
            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h2 className="font-display font-semibold text-surface-900 mb-4">Booking Sources</h2>
              <SourceDonutChart data={sourceData} />
            </div>
          )}
        </div>
      )}

      {courts.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">Court Occupancy — Next 7 Days</h2>
          </div>
          <OccupancyHeatmap courts={courts} />
        </div>
      )}

      {recentBookings.length > 0 && (
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
                      {booking.slot && (
                        <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatTime(booking.slot.start_time)} – {formatTime(booking.slot.end_time)}
                        </p>
                      )}
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
      )}

      <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </div>
  )
}
