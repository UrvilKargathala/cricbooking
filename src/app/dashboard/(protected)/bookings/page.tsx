'use client'

import { useState } from 'react'
import { Plus, Clock, Search, X } from 'lucide-react'
import { DEMO_OWNER_BOOKINGS } from '@/lib/demo-data'
import { formatPrice, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BookingDetailsModal } from '@/components/dashboard/BookingDetailsModal'
import type { Booking } from '@/types'

const COURTS = ['All Courts', 'Box-1 Turf', 'Box-2 Mat']
const STATUSES = ['All Status', 'confirmed', 'cancelled', 'completed']
const SOURCES = ['All Sources', 'online', 'walkin', 'phone']

const selectClass =
  'px-3 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

export default function DashboardBookingsPage() {
  const [date, setDate] = useState('')
  const [court, setCourt] = useState('All Courts')
  const [status, setStatus] = useState('All Status')
  const [source, setSource] = useState('All Sources')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = DEMO_OWNER_BOOKINGS.filter((booking) => {
    if (date && booking.slot?.date !== date) return false
    if (court !== 'All Courts' && booking.court?.name !== court) return false
    if (status !== 'All Status' && booking.status !== status) return false
    if (source !== 'All Sources' && booking.source !== source) return false
    return true
  })

  const allSelected = filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id))

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map((b) => b.id)))
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const runBulkAction = (action: string) => {
    alert(`${action} for ${selectedIds.size} booking(s). Backend wiring coming in a later phase.`)
    setSelectedIds(new Set())
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-xl text-surface-900">Bookings</h1>
        <Button
          variant="primary"
          onClick={() => alert('Walk-in booking form coming in backend phase.')}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create Walk-in
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={selectClass} />
        <select value={court} onChange={(e) => setCourt(e.target.value)} className={selectClass}>
          {COURTS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'All Status' ? s : s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s === 'All Sources' ? s : s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm font-medium text-brand-900">{selectedIds.size} selected</span>
          <button
            onClick={() => runBulkAction('Marked as paid')}
            className="text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg px-3 py-1.5 transition-colors"
          >
            Mark as Paid
          </button>
          <button
            onClick={() => runBulkAction('Cancelled')}
            className="text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors"
          >
            Cancel Bookings
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-surface-800/50 hover:text-surface-800 flex items-center gap-1 text-sm"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <p className="px-5 pt-4 pb-2 text-sm text-surface-800/50">Showing {filtered.length} bookings</p>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="w-10 h-10 text-surface-800/20 mx-auto" />
            <p className="text-surface-800/50 mt-2">No bookings match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-800/50 border-b border-surface-100">
                  <th className="pb-3 font-medium w-8">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-brand-600" />
                  </th>
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
                {filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="cursor-pointer hover:bg-surface-50"
                  >
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(booking.id)}
                        onChange={() => toggleOne(booking.id)}
                        className="w-4 h-4 accent-brand-600"
                      />
                    </td>
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
        )}
      </div>

      <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </div>
  )
}
