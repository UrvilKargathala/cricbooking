'use client'

import { useState } from 'react'
import { Download, Search } from 'lucide-react'
import { DEMO_OWNER_BOOKINGS } from '@/lib/demo-data'
import { formatPrice, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

const VENUES = ['All Venues', 'Surat Cricket Arena', 'Green Pitch Sports', 'Champion Turf Ground']
const STATUSES = ['All Status', 'confirmed', 'cancelled', 'completed', 'no_show']
const SOURCES = ['All Sources', 'online', 'walkin', 'phone']
const PAYMENTS = ['All Payment', 'paid', 'pending', 'refunded']

const selectClass =
  'px-3 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

const emptyFilters = {
  dateFrom: '', dateTo: '', venue: 'All Venues', status: 'All Status', source: 'All Sources', payment: 'All Payment',
}

export default function AdminBookingsPage() {
  const [filters, setFilters] = useState(emptyFilters)

  const filtered = DEMO_OWNER_BOOKINGS.filter((booking) => {
    const venueName = booking.venue?.name || 'Surat Cricket Arena'
    if (filters.dateFrom && (booking.slot?.date ?? '') < filters.dateFrom) return false
    if (filters.dateTo && (booking.slot?.date ?? '') > filters.dateTo) return false
    if (filters.venue !== 'All Venues' && venueName !== filters.venue) return false
    if (filters.status !== 'All Status' && booking.status !== filters.status) return false
    if (filters.source !== 'All Sources' && booking.source !== filters.source) return false
    if (filters.payment !== 'All Payment' && booking.payment_status !== filters.payment) return false
    return true
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-xl text-surface-900">All Bookings</h1>
        <Button
          variant="outline"
          onClick={() => alert('Export feature coming in backend phase.')}
          className="flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
          className={selectClass}
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
          className={selectClass}
        />
        <select value={filters.venue} onChange={(e) => setFilters((f) => ({ ...f, venue: e.target.value }))} className={selectClass}>
          {VENUES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className={selectClass}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'All Status' ? s : s[0].toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
        </select>
        <select value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))} className={selectClass}>
          {SOURCES.map((s) => <option key={s} value={s}>{s === 'All Sources' ? s : s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={filters.payment} onChange={(e) => setFilters((f) => ({ ...f, payment: e.target.value }))} className={selectClass}>
          {PAYMENTS.map((p) => <option key={p} value={p}>{p === 'All Payment' ? p : p[0].toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <p className="px-5 pt-4 pb-2 text-sm text-surface-800/50">Showing {filtered.length} bookings</p>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="w-10 h-10 text-surface-800/20 mx-auto" />
            <p className="text-surface-800/50 mt-2 mb-4">No bookings match your filters</p>
            <Button variant="ghost" onClick={() => setFilters(emptyFilters)}>Clear Filters</Button>
          </div>
        ) : (
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-800/50 border-b border-surface-100">
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium">Venue</th>
                  <th className="pb-3 font-medium">Court</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((booking) => (
                  <tr key={booking.id}>
                    <td className="py-3 font-mono text-xs text-surface-800/70">{booking.booking_code}</td>
                    <td className="py-3 font-medium text-surface-900 text-sm">{booking.venue?.name || 'Surat Cricket Arena'}</td>
                    <td className="py-3 text-surface-800/70 text-sm">{booking.court?.name}</td>
                    <td className="py-3 font-medium text-surface-900">
                      {booking.user?.full_name || booking.customer_name || 'Walk-in'}
                    </td>
                    <td className="py-3 text-surface-800/70 text-sm">{booking.slot?.date}</td>
                    <td className="py-3 text-surface-800/70 text-sm">
                      {formatTime(booking.slot!.start_time)} - {formatTime(booking.slot!.end_time)}
                    </td>
                    <td className="py-3 font-medium">{formatPrice(booking.amount)}</td>
                    <td className="py-3">
                      <Badge variant={booking.source}>{booking.source}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={booking.status}>{booking.status}</Badge>
                    </td>
                    <td className="py-3">
                      {booking.payment_status === 'pending' ? (
                        <span className="text-amber-600 text-xs font-medium">Pending</span>
                      ) : booking.payment_status === 'refunded' ? (
                        <span className="text-surface-800/50 text-xs font-medium">Refunded</span>
                      ) : (
                        <span className="text-emerald-600 text-xs font-medium">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
