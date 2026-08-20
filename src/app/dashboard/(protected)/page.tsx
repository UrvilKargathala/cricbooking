'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Calendar, IndianRupee, TrendingUp, Clock,
  Zap, Ban, AlertCircle, MapPin,
  Users, BarChart3, ArrowRight, Download, Wallet, Loader2,
} from 'lucide-react'
import { formatPrice, formatTime, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { fetchOwnerBookings, fetchOwnerVenues } from '@/lib/supabase-queries'
import type { Slot, Venue } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { BookingDetailsModal } from '@/components/dashboard/BookingDetailsModal'
import { RevenueAreaChart } from '@/components/dashboard/RevenueAreaChart'
import { BookingsBarChart } from '@/components/dashboard/BookingsBarChart'
import { PaymentDonutChart } from '@/components/dashboard/PaymentDonutChart'
import { SourceDonutChart } from '@/components/dashboard/SourceDonutChart'
import { OccupancyHeatmap } from '@/components/dashboard/OccupancyHeatmap'
import { useToastStore } from '@/store/useToastStore'
import { useAuth } from '@/hooks/useAuth'
import type { Booking, Court } from '@/types'

type DateRange = 'today' | 'week' | 'month' | 'all'

function getDateRangeStart(range: DateRange): string | null {
  const now = new Date()
  if (range === 'all') return null
  if (range === 'today') return now.toISOString().split('T')[0]
  if (range === 'week') {
    now.setDate(now.getDate() - 7)
    return now.toISOString().split('T')[0]
  }
  now.setDate(now.getDate() - 30)
  return now.toISOString().split('T')[0]
}

function CircularProgress({ value, size = 80, stroke = 8 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value >= 75 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[280px] text-surface-400">
      <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
      <p className="text-xs mt-1">Data will appear as bookings come in</p>
    </div>
  )
}

export default function DashboardOverviewPage() {
  const { user: authProfile } = useAuth()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueIds, setVenueIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [todaySlots, setTodaySlots] = useState<Slot[]>([])
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<{ status: string; created_at: string } | null>(null)
  const showToast = useToastStore((s) => s.showToast)

  const fetchDashboardData = async (userId: string) => {
    const [b, v] = await Promise.all([
      fetchOwnerBookings(userId),
      fetchOwnerVenues(userId),
    ])
    setBookings(b)
    setVenues(v)
    const allCourts = v.flatMap((venue) => venue.courts ?? [])
    setCourts(allCourts)
    setVenueIds(v.map((venue) => venue.id))

    if (allCourts.length > 0) {
      const supabase = createClient()
      const todayDate = new Date().toISOString().split('T')[0]
      const { data: slotsData } = await supabase
        .from('slots')
        .select('id, status, start_time')
        .in('court_id', allCourts.map((c) => c.id))
        .eq('date', todayDate)
      setTodaySlots((slotsData as Slot[]) || [])
    }
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setOwnerId(user.id)
        await fetchDashboardData(user.id)
        const { data: app } = await supabase
          .from('owner_applications')
          .select('status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (app) setApplicationStatus(app)
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

  const today = new Date().toISOString().split('T')[0]

  const filteredBookings = useMemo(() => {
    const rangeStart = getDateRangeStart(dateRange)
    const active = bookings.filter((b) => b.status !== 'cancelled')
    if (!rangeStart) return active
    return active.filter((b) => (b.slot?.date ?? '') >= rangeStart)
  }, [bookings, dateRange])

  const todaysBookings = useMemo(
    () => bookings.filter((b) => b.status !== 'cancelled' && b.slot?.date === today),
    [bookings, today]
  )

  const pendingPayments = useMemo(
    () => bookings.filter((b) => b.payment_status === 'pending' && b.status !== 'cancelled'),
    [bookings]
  )

  const popularTimeSlots = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredBookings.forEach((b) => {
      if (b.slot?.start_time) {
        const t = b.slot.start_time.slice(0, 5)
        counts[t] = (counts[t] ?? 0) + 1
      }
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([time, count]) => ({ time, count }))
  }, [filteredBookings])

  const todaySchedule = useMemo(() => {
    return todaysBookings
      .filter((b) => b.slot?.start_time)
      .sort((a, b) => (a.slot?.start_time ?? '').localeCompare(b.slot?.start_time ?? ''))
      .slice(0, 6)
  }, [todaysBookings])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const rangeRevenue = filteredBookings.reduce((sum, b) => sum + b.amount, 0)
  const todaysRevenue = todaysBookings.reduce((sum, b) => sum + b.amount, 0)
  const todayTotalSlots = todaySlots.length
  const todayBookedSlots = todaySlots.filter((s) => s.status === 'booked').length
  const todayAvailableSlots = todaySlots.filter((s) => s.status === 'available').length
  const occupancyRate = todayTotalSlots > 0
    ? Math.round((todayBookedSlots / todayTotalSlots) * 100)
    : 0

  const RANGE_LABELS: Record<DateRange, string> = {
    today: 'Today',
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    all: 'All Time',
  }

  const revenueChartData = Object.entries(
    filteredBookings.reduce<Record<string, number>>((acc, b) => {
      const date = b.slot?.date ?? 'unknown'
      acc[date] = (acc[date] ?? 0) + b.amount
      return acc
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b)).map(([date, revenue]) => ({
    date: date.slice(5),
    revenue,
  }))

  const bookingsChartData = Object.entries(
    filteredBookings.reduce<Record<string, number>>((acc, b) => {
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

  const onlineCount = filteredBookings.filter((b) => b.source === 'online').length
  const walkinCount = filteredBookings.filter((b) => b.source === 'walkin').length
  const phoneCount = filteredBookings.filter((b) => b.source === 'phone').length
  const sourceData = [
    { name: 'Online', value: onlineCount, color: '#1d8ad7' },
    { name: 'Walk-in', value: walkinCount, color: '#3ea2ea' },
    { name: 'Phone', value: phoneCount, color: '#73b7e8' },
  ].filter((d) => d.value > 0)

  const recentBookings = bookings.slice(0, 6)
  const ownerName = authProfile?.full_name?.split(' ')[0] || 'there'
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white">
        <img src="/dashboard-banner.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-800/80 to-brand-900/60" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl">
              {greeting}, {ownerName}!
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-white/70">
                <MapPin className="w-3.5 h-3.5" />
                <span>{venues.length} venue{venues.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/70">
                <Users className="w-3.5 h-3.5" />
                <span>{courts.length} court{courts.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/70">
                <Clock className="w-3.5 h-3.5" />
                <span>{todayTotalSlots} slots today</span>
              </div>
            </div>
          </div>
          <div className="flex bg-white/15 backdrop-blur-sm rounded-lg p-0.5 self-start">
            {(['today', 'week', 'month', 'all'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  dateRange === r
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'week' ? '7D' : r === 'month' ? '30D' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Application Status Banner */}
      {applicationStatus && venues.length === 0 && (
        <div className={cn(
          'rounded-xl border p-5 flex items-start gap-4',
          applicationStatus.status === 'pending' && 'bg-amber-50 border-amber-200',
          applicationStatus.status === 'approved' && 'bg-emerald-50 border-emerald-200',
          applicationStatus.status === 'rejected' && 'bg-red-50 border-red-200',
        )}>
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            applicationStatus.status === 'pending' && 'bg-amber-100',
            applicationStatus.status === 'approved' && 'bg-emerald-100',
            applicationStatus.status === 'rejected' && 'bg-red-100',
          )}>
            <AlertCircle className={cn('w-5 h-5',
              applicationStatus.status === 'pending' && 'text-amber-600',
              applicationStatus.status === 'approved' && 'text-emerald-600',
              applicationStatus.status === 'rejected' && 'text-red-600',
            )} />
          </div>
          <div>
            <p className={cn('font-display font-semibold',
              applicationStatus.status === 'pending' && 'text-amber-800',
              applicationStatus.status === 'approved' && 'text-emerald-800',
              applicationStatus.status === 'rejected' && 'text-red-800',
            )}>
              {applicationStatus.status === 'pending' && 'Application Under Review'}
              {applicationStatus.status === 'approved' && 'Application Approved!'}
              {applicationStatus.status === 'rejected' && 'Application Needs Changes'}
            </p>
            <p className={cn('text-sm mt-0.5',
              applicationStatus.status === 'pending' && 'text-amber-600',
              applicationStatus.status === 'approved' && 'text-emerald-600',
              applicationStatus.status === 'rejected' && 'text-red-600',
            )}>
              {applicationStatus.status === 'pending' && 'Your venue application is being reviewed. This usually takes 24-48 hours.'}
              {applicationStatus.status === 'approved' && 'Go to My Venues to add your first venue and start receiving bookings.'}
              {applicationStatus.status === 'rejected' && 'Please contact support or re-apply with updated documents.'}
            </p>
            <p className="text-xs text-surface-400 mt-2">
              Submitted on {new Date(applicationStatus.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/dashboard/slots?action=generate" className="group bg-white rounded-xl border border-surface-200 p-4 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-surface-900">Generate Slots</p>
          <p className="text-xs text-surface-400 mt-0.5">Create time slots for courts</p>
        </Link>
        <Link href="/dashboard/slots?action=block" className="group bg-white rounded-xl border border-surface-200 p-4 hover:border-red-300 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
            <Ban className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-surface-900">Block Day</p>
          <p className="text-xs text-surface-400 mt-0.5">Block a day for maintenance</p>
        </Link>
        <Link href="/dashboard/bookings" className="group bg-white rounded-xl border border-surface-200 p-4 hover:border-amber-300 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-surface-900">Bookings</p>
          <p className="text-xs text-surface-400 mt-0.5">View & manage bookings</p>
        </Link>
        <Link href="/dashboard/venues" className="group bg-white rounded-xl border border-surface-200 p-4 hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-surface-900">My Venues</p>
          <p className="text-xs text-surface-400 mt-0.5">Edit venues & courts</p>
        </Link>
      </div>

      {/* Stats Cards with colored left borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 border-l-4 border-l-blue-500 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-surface-500">Today&apos;s Bookings</p>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-blue-600" />
            </div>
          </div>
          <p className="font-display font-bold text-3xl text-surface-900">{todaysBookings.length}</p>
          <p className="text-xs text-surface-400 mt-1">{todayAvailableSlots} slots still available</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 border-l-4 border-l-emerald-500 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-surface-500">Today&apos;s Revenue</p>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <IndianRupee className="w-4.5 h-4.5 text-emerald-600" />
            </div>
          </div>
          <p className="font-display font-bold text-3xl text-surface-900">{formatPrice(todaysRevenue)}</p>
          <p className="text-xs text-surface-400 mt-1">{todaysBookings.length} booking{todaysBookings.length !== 1 ? 's' : ''} today</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 border-l-4 border-l-amber-500 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-surface-500">Revenue ({RANGE_LABELS[dateRange]})</p>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
            </div>
          </div>
          <p className="font-display font-bold text-3xl text-surface-900">{formatPrice(rangeRevenue)}</p>
          <button onClick={() => setPayoutOpen(true)} className="text-xs text-brand-600 font-medium mt-1 hover:underline flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Request Payout
          </button>
        </div>

        {/* Occupancy Card with circular progress */}
        <div className="bg-white rounded-xl border border-surface-200 border-l-4 border-l-purple-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-surface-500 mb-2">Occupancy Rate</p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <CircularProgress value={occupancyRate} size={64} stroke={6} />
              <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm text-surface-900">
                {occupancyRate}%
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900">{todayBookedSlots}/{todayTotalSlots}</p>
              <p className="text-xs text-surface-400">slots booked today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <Link
          href="/dashboard/bookings"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 hover:bg-amber-100 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {pendingPayments.length} pending payment{pendingPayments.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-600">
              {formatPrice(pendingPayments.reduce((s, b) => s + b.amount, 0))} awaiting confirmation
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 transition-colors shrink-0" />
        </Link>
      )}

      {/* Charts — always visible */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-surface-900">Analytics</h2>
        <button
          onClick={() => {
            if (filteredBookings.length === 0) { showToast('No data to export.', 'info'); return }
            const headers = ['Date','Bookings','Revenue','Online','Walk-in','Phone']
            const dailyMap: Record<string, { count: number; revenue: number; online: number; walkin: number; phone: number }> = {}
            filteredBookings.forEach(b => {
              const d = b.slot?.date ?? 'unknown'
              if (!dailyMap[d]) dailyMap[d] = { count: 0, revenue: 0, online: 0, walkin: 0, phone: 0 }
              dailyMap[d].count++
              dailyMap[d].revenue += b.amount
              if (b.source === 'online') dailyMap[d].online++
              else if (b.source === 'walkin') dailyMap[d].walkin++
              else dailyMap[d].phone++
            })
            const rows = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) =>
              [date, d.count, d.revenue, d.online, d.walkin, d.phone]
            )
            const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics-${RANGE_LABELS[dateRange].replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            URL.revokeObjectURL(url)
            showToast(`Exported analytics for ${Object.keys(dailyMap).length} days.`, 'success')
          }}
          className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700"
        >
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">Revenue Trend</h2>
            <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-md">{RANGE_LABELS[dateRange]}</span>
          </div>
          {revenueChartData.length > 0 ? (
            <RevenueAreaChart data={revenueChartData} />
          ) : (
            <EmptyChart message="No revenue data yet" />
          )}
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">Daily Bookings</h2>
            <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-md">{RANGE_LABELS[dateRange]}</span>
          </div>
          {bookingsChartData.length > 0 ? (
            <BookingsBarChart data={bookingsChartData} />
          ) : (
            <EmptyChart message="No booking data yet" />
          )}
        </div>
      </div>

      {/* Today's Schedule + Popular Time Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">Today&apos;s Schedule</h2>
            <Link href="/dashboard/bookings" className="text-xs text-brand-600 font-medium hover:underline">View All</Link>
          </div>
          {todaySchedule.length > 0 ? (
            <div className="space-y-0">
              {todaySchedule.map((booking, i) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`flex items-center gap-3 py-3 cursor-pointer hover:bg-surface-50 rounded-lg px-2 -mx-2 transition-colors ${
                    i < todaySchedule.length - 1 ? 'border-b border-surface-100' : ''
                  }`}
                >
                  <div className="w-12 text-center shrink-0">
                    <p className="text-xs font-bold text-brand-600">{formatTime(booking.slot!.start_time)}</p>
                    <p className="text-[10px] text-surface-400">{formatTime(booking.slot!.end_time)}</p>
                  </div>
                  <div className="w-0.5 h-8 bg-brand-200 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">
                      {booking.user?.full_name || booking.customer_name || 'Walk-in'}
                    </p>
                    <p className="text-xs text-surface-400 truncate">{booking.court?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-surface-900">{formatPrice(booking.amount)}</p>
                    <Badge variant={booking.payment_status as 'paid' | 'pending' | 'refunded'}>{booking.payment_status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-surface-400">
              <Calendar className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No bookings scheduled today</p>
              <Link href="/dashboard/slots" className="text-xs text-brand-600 font-medium mt-2 hover:underline">
                Generate slots to get started
              </Link>
            </div>
          )}
        </div>

        {/* Popular Time Slots */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">Popular Time Slots</h2>
            <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-md">{RANGE_LABELS[dateRange]}</span>
          </div>
          {popularTimeSlots.length > 0 ? (
            <div className="space-y-4">
              {popularTimeSlots.map((slot, i) => {
                const maxCount = popularTimeSlots[0].count
                const pct = Math.round((slot.count / maxCount) * 100)
                const colors = ['bg-brand-600', 'bg-brand-500', 'bg-brand-400', 'bg-brand-300', 'bg-brand-200']
                return (
                  <div key={slot.time}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-surface-100 text-[10px] font-bold text-surface-500 flex items-center justify-center">
                          {i + 1}
                        </span>
                        <Clock className="w-3.5 h-3.5 text-surface-400" />
                        <span className="text-sm font-medium text-surface-800">{formatTime(slot.time)}</span>
                      </div>
                      <span className="text-sm font-bold text-surface-900">{slot.count} booking{slot.count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="ml-9 h-2.5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[i] || colors[0]} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-surface-400">
              <Clock className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No booking patterns yet</p>
              <p className="text-xs mt-1">Insights appear as bookings come in</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment + Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h2 className="font-display font-semibold text-surface-900 mb-4">Payment Breakdown</h2>
          {paymentData.length > 0 ? (
            <PaymentDonutChart data={paymentData} total={paidAmount + pendingAmount + refundedAmount} />
          ) : (
            <EmptyChart message="No payment data yet" />
          )}
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h2 className="font-display font-semibold text-surface-900 mb-4">Booking Sources</h2>
          {sourceData.length > 0 ? (
            <SourceDonutChart data={sourceData} />
          ) : (
            <EmptyChart message="No source data yet" />
          )}
        </div>
      </div>

      {/* Occupancy Heatmap */}
      {courts.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">Court Occupancy — Next 7 Days</h2>
          </div>
          <OccupancyHeatmap courts={courts} />
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-semibold text-surface-900">Recent Bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentBookings.length > 0 ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-surface-400">
            <Calendar className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No bookings yet</p>
            <p className="text-xs mt-1">Bookings will appear here as they come in</p>
          </div>
        )}
      </div>

      <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      <PayoutModal
        isOpen={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        paidAmount={paidAmount}
        pendingAmount={pendingAmount}
      />
    </div>
  )
}

function PayoutModal({ isOpen, onClose, paidAmount, pendingAmount }: {
  isOpen: boolean; onClose: () => void; paidAmount: number; pendingAmount: number
}) {
  const [amount, setAmount] = useState('')
  const [upiId, setUpiId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const showToast = useToastStore(s => s.showToast)

  const platformFee = Math.round(paidAmount * 0.05)
  const availableBalance = paidAmount - platformFee

  const handleSubmit = async () => {
    const requestedAmount = Number(amount)
    if (!requestedAmount || requestedAmount <= 0) { showToast('Enter a valid amount.', 'error'); return }
    if (requestedAmount > availableBalance) { showToast('Amount exceeds available balance.', 'error'); return }
    setSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    const { error } = await supabase.from('payout_requests').insert({
      owner_id: user.id,
      amount: requestedAmount,
      upi_id: upiId.trim() || null,
      status: 'pending',
    })

    setSubmitting(false)
    if (error) {
      if (error.code === '42P01') {
        setSubmitted(true)
        return
      }
      showToast(`Error: ${error.message}`, 'error')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={() => { onClose(); setSubmitted(false); setAmount(''); setUpiId('') }} title="Payout Request">
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-3">
            <Wallet className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="font-display font-semibold text-lg text-surface-900">Payout Request Submitted</p>
          <p className="text-sm text-surface-500 mt-1">
            Your withdrawal of {formatPrice(Number(amount))} has been submitted. Payouts are processed within 3-5 business days.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => { onClose(); setSubmitted(false); setAmount(''); setUpiId('') }}>
            Done
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Payout">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 rounded-lg p-3">
            <p className="text-xs text-emerald-600 font-medium">Total Collected</p>
            <p className="font-display font-bold text-lg text-emerald-800 mt-0.5">{formatPrice(paidAmount)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600 font-medium">Pending Payments</p>
            <p className="font-display font-bold text-lg text-amber-800 mt-0.5">{formatPrice(pendingAmount)}</p>
          </div>
        </div>
        <div className="bg-surface-50 rounded-lg p-3 text-sm">
          <div className="flex justify-between text-surface-600">
            <span>Platform fee (5%)</span>
            <span>-{formatPrice(platformFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-surface-900 mt-1 pt-1 border-t border-surface-200">
            <span>Available for payout</span>
            <span>{formatPrice(availableBalance)}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Withdrawal Amount (₹)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            max={availableBalance} placeholder={String(availableBalance)}
            className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">UPI ID (optional)</label>
          <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
            placeholder="owner@upi"
            className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <p className="text-xs text-surface-400 mt-1">Falls back to your registered bank account if not provided</p>
        </div>
        <Button onClick={handleSubmit} disabled={submitting || !amount} className="w-full flex items-center justify-center gap-2">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Wallet className="w-4 h-4" /> Request Payout</>}
        </Button>
        <p className="text-xs text-surface-400 text-center">Payouts are processed within 3-5 business days</p>
      </div>
    </Modal>
  )
}
