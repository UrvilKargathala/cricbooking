'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Plus, Clock, Search, X, Download, Filter, Loader2,
  CalendarCheck, CalendarX, IndianRupee, Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { fetchOwnerBookings, fetchOwnerVenues, fetchSlots } from '@/lib/supabase-queries'
import { formatPrice, formatTime, generateBookingCode, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { BookingDetailsModal } from '@/components/dashboard/BookingDetailsModal'
import { useToastStore } from '@/store/useToastStore'
import type { Booking, Venue, Slot } from '@/types'

const STATUSES = ['All', 'confirmed', 'cancelled', 'completed']
const SOURCES = ['All', 'online', 'walkin', 'phone']
const PAYMENTS = ['All', 'paid', 'pending', 'refunded', 'full_paid']

const selectClass =
  'px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none cursor-pointer'

export default function DashboardBookingsPage() {
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [courtNames, setCourtNames] = useState<string[]>([])
  const [venueIds, setVenueIds] = useState<string[]>([])
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [date, setDate] = useState('')
  const [court, setCourt] = useState('All Courts')
  const [status, setStatus] = useState('All')
  const [source, setSource] = useState('All')
  const [payment, setPayment] = useState('All')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [venues, setVenues] = useState<Venue[]>([])
  const [walkinOpen, setWalkinOpen] = useState(false)
  const [pageSize, setPageSize] = useState(20)
  const showToast = useToastStore((s) => s.showToast)

  const fetchBookings = async (userId: string) => {
    const [bookings, venues] = await Promise.all([
      fetchOwnerBookings(userId),
      fetchOwnerVenues(userId),
    ])
    setAllBookings(bookings)
    setVenues(venues)
    const names = venues.flatMap((v) => v.courts ?? []).map((c) => c.name)
    setCourtNames(Array.from(new Set(names)))
    setVenueIds(venues.map((v) => v.id))
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setOwnerId(user.id)
        await fetchBookings(user.id)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!ownerId || venueIds.length === 0) return
    const supabase = createClient()
    const channel = supabase
      .channel('owner-bookings-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT' && venueIds.includes(payload.new.venue_id)) {
            fetchBookings(ownerId)
            showToast('New booking received!', 'success')
          } else if (payload.eventType === 'UPDATE' && venueIds.includes(payload.new.venue_id)) {
            fetchBookings(ownerId)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [ownerId, venueIds, showToast])

  const filtered = useMemo(() => allBookings.filter((booking) => {
    if (date && booking.slot?.date !== date) return false
    if (court !== 'All Courts' && booking.court?.name !== court) return false
    if (status !== 'All' && booking.status !== status) return false
    if (source !== 'All' && booking.source !== source) return false
    if (payment !== 'All' && booking.payment_status !== payment) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const name = (booking.user?.full_name || booking.customer_name || '').toLowerCase()
      const code = booking.booking_code.toLowerCase()
      if (!name.includes(q) && !code.includes(q)) return false
    }
    return true
  }), [allBookings, date, court, status, source, payment, searchQuery])

  const activeFilterCount = [date, court !== 'All Courts', status !== 'All', source !== 'All', payment !== 'All', searchQuery].filter(Boolean).length

  const confirmedCount = allBookings.filter((b) => b.status === 'confirmed').length
  const pendingPaymentCount = allBookings.filter((b) => b.payment_status === 'pending' && b.status !== 'cancelled').length
  const cancelledCount = allBookings.filter((b) => b.status === 'cancelled').length
  const totalRevenue = allBookings.filter((b) => b.payment_status !== 'pending' && b.status !== 'cancelled').reduce((s, b) => s + b.amount, 0)

  const allSelected = filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id))

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map((b) => b.id)))
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDate('')
    setCourt('All Courts')
    setStatus('All')
    setSource('All')
    setPayment('All')
  }

  const runBulkAction = async (action: string) => {
    if (!ownerId || selectedIds.size === 0) return
    const supabase = createClient()
    const ids = Array.from(selectedIds)

    if (action === 'mark_paid') {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .in('id', ids)
      if (error) {
        showToast(`Error: ${error.message}`, 'error')
        return
      }
      showToast(`Marked ${ids.length} booking(s) as paid.`, 'success')
    } else if (action === 'cancel') {
      if (!confirm(`Cancel ${ids.length} booking(s)? This cannot be undone.`)) return
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .in('id', ids)
      if (error) {
        showToast(`Error: ${error.message}`, 'error')
        return
      }
      showToast(`Cancelled ${ids.length} booking(s).`, 'success')
    }

    setSelectedIds(new Set())
    await fetchBookings(ownerId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const STATS = [
    { label: 'Total Bookings', value: String(allBookings.length), icon: Calendar, bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Confirmed', value: String(confirmedCount), icon: CalendarCheck, bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { label: 'Pending Payment', value: String(pendingPaymentCount), icon: IndianRupee, bg: 'bg-amber-100', text: 'text-amber-600' },
    { label: 'Cancelled', value: String(cancelledCount), icon: CalendarX, bg: 'bg-red-100', text: 'text-red-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-surface-900">Bookings</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage and track all bookings across your venues.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (filtered.length === 0) { showToast('No bookings to export.', 'info'); return }
              const headers = ['Booking Code','Customer','Phone','Court','Date','Time','Amount','Source','Payment','Status']
              const rows = filtered.map(b => [
                b.booking_code,
                b.user?.full_name || b.customer_name || 'Walk-in',
                b.customer_phone || '',
                b.court?.name || '',
                b.slot?.date || '',
                b.slot ? `${formatTime(b.slot.start_time)} - ${formatTime(b.slot.end_time)}` : '',
                String(b.amount),
                b.source,
                b.payment_status,
                b.status,
              ])
              const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              URL.revokeObjectURL(url)
              showToast(`Exported ${filtered.length} bookings.`, 'success')
            }}
            className="flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="primary"
            onClick={() => setWalkinOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Walk-in
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 px-4 py-3.5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.text}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-surface-900">{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search by name or booking code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={selectClass} />
            <select value={court} onChange={(e) => setCourt(e.target.value)} className={selectClass}>
              <option value="All Courts">All Courts</option>
              {courtNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
              {STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Status' : s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
              {SOURCES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Sources' : s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select value={payment} onChange={(e) => setPayment(e.target.value)} className={selectClass}>
              {PAYMENTS.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Payments' : s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Filter className="w-3.5 h-3.5" />
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 bg-brand-50 border-b border-brand-200 px-5 py-3">
            <span className="text-sm font-semibold text-brand-900">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => runBulkAction('mark_paid')}
                className="text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                Mark Paid
              </button>
              <button
                onClick={() => runBulkAction('cancel')}
                className="text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-surface-400 hover:text-surface-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <p className="text-sm text-surface-500">
            Showing <span className="font-medium text-surface-700">{filtered.length}</span> of {allBookings.length} bookings
          </p>
          <p className="text-xs text-surface-400">
            Revenue: <span className="font-semibold text-surface-700">{formatPrice(totalRevenue)}</span>
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Search className="w-12 h-12 text-surface-200 mx-auto" />
            <p className="text-surface-500 mt-3 font-medium">No bookings found</p>
            <p className="text-sm text-surface-400 mt-1">Try adjusting your filters or search query.</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-brand-600 font-medium mt-3 hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-auto">
              <thead>
                <tr className="text-left text-surface-500 border-b border-surface-100 bg-surface-50/50">
                  <th className="py-3 pl-5 font-medium w-8">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-brand-600 rounded" />
                  </th>
                  <th className="py-3 pr-4 font-medium whitespace-nowrap">Code</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Court</th>
                  <th className="py-3 pr-6 font-medium whitespace-nowrap">Date & Time</th>
                  <th className="py-3 pr-6 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Source</th>
                  <th className="py-3 pr-4 font-medium">Payment</th>
                  <th className="py-3 pr-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.slice(0, pageSize).map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="cursor-pointer hover:bg-surface-50 transition-colors"
                  >
                    <td className="py-3.5 pl-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(booking.id)}
                        onChange={() => toggleOne(booking.id)}
                        className="w-4 h-4 accent-brand-600 rounded"
                      />
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-xs text-surface-500 whitespace-nowrap">{booking.booking_code}</td>
                    <td className="py-3.5 pr-4">
                      <p className="font-medium text-surface-900">
                        {booking.user?.full_name || booking.customer_name || 'Walk-in'}
                      </p>
                      {booking.customer_phone && (
                        <p className="text-xs text-surface-400 mt-0.5">{booking.customer_phone}</p>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 text-surface-600">{booking.court?.name}</td>
                    <td className="py-3.5 pr-6 text-surface-900 whitespace-nowrap">
                      {booking.slot?.date} {booking.slot && (
                        <span className="text-surface-500">· {formatTime(booking.slot.start_time)} – {formatTime(booking.slot.end_time)}</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-6 font-semibold text-surface-900 whitespace-nowrap">{formatPrice(booking.amount)}</td>
                    <td className="py-3.5 pr-4">
                      <Badge variant={booking.source}>{booking.source}</Badge>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge variant={booking.payment_status as 'paid' | 'pending' | 'refunded'}>{booking.payment_status}</Badge>
                    </td>
                    <td className="py-3.5 pr-5">
                      <Badge variant={booking.status}>{booking.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pageSize < filtered.length && (
              <div className="text-center py-4 border-t border-surface-100">
                <button
                  onClick={() => setPageSize((s) => s + 20)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Show more ({filtered.length - pageSize} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      <WalkinModal
        isOpen={walkinOpen}
        onClose={() => setWalkinOpen(false)}
        venues={venues}
        onCreated={() => { if (ownerId) fetchBookings(ownerId) }}
      />
    </div>
  )
}

function WalkinModal({ isOpen, onClose, venues, onCreated }: {
  isOpen: boolean; onClose: () => void; venues: Venue[]; onCreated: () => void
}) {
  const allCourts = venues.flatMap(v => (v.courts ?? []).map(c => ({ ...c, venueName: v.name, venueId: v.id })))
  const [courtId, setCourtId] = useState(allCourts[0]?.id || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotId, setSlotId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const showToast = useToastStore(s => s.showToast)

  useEffect(() => {
    if (!courtId || !date || !isOpen) return
    setLoadingSlots(true)
    fetchSlots(courtId, date).then(s => {
      setSlots(s.filter(sl => sl.status === 'available'))
      setSlotId('')
      setLoadingSlots(false)
    })
  }, [courtId, date, isOpen])

  useEffect(() => {
    if (isOpen && allCourts.length > 0 && !courtId) setCourtId(allCourts[0].id)
  }, [isOpen])

  const selectedSlot = slots.find(s => s.id === slotId)
  const selectedCourt = allCourts.find(c => c.id === courtId)

  const handleSubmit = async () => {
    if (!slotId || !selectedCourt || !selectedSlot) return
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    const code = generateBookingCode()
    const { error } = await supabase.from('bookings').insert({
      booking_code: code,
      user_id: null,
      venue_id: selectedCourt.venueId,
      court_id: courtId,
      slot_id: slotId,
      booked_by: user.id,
      source: 'walkin',
      customer_name: customerName.trim() || 'Walk-in Customer',
      customer_phone: customerPhone ? `+91${customerPhone}` : null,
      amount: Number(selectedSlot.price),
      payment_status: 'paid',
      status: 'confirmed',
    })

    if (error) {
      showToast(`Error: ${error.message}`, 'error')
      setSubmitting(false)
      return
    }

    await supabase.from('slots').update({ status: 'booked' }).eq('id', slotId)
    showToast(`Walk-in booking ${code} created!`, 'success')
    setSubmitting(false)
    setCustomerName('')
    setCustomerPhone('')
    setSlotId('')
    onCreated()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Walk-in Booking">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Court</label>
          <select value={courtId} onChange={e => setCourtId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            {allCourts.map(c => <option key={c.id} value={c.id}>{c.venueName} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Date</label>
          <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Available Slot</label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-surface-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading slots...
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-surface-400 py-2">No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {slots.map(s => (
                <button key={s.id} type="button" onClick={() => setSlotId(s.id)}
                  className={cn('text-xs py-2 px-2 rounded-lg border text-center transition-all',
                    slotId === s.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-surface-200 hover:border-brand-400'
                  )}>
                  {formatTime(s.start_time)}
                  <span className="block text-[10px] mt-0.5 opacity-70">{formatPrice(Number(s.price))}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Customer Name</label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
              className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Phone</label>
            <div className="flex">
              <span className="bg-surface-100 border border-surface-200 rounded-l-lg px-2 flex items-center text-xs text-surface-500 shrink-0">+91</span>
              <input type="tel" maxLength={10} value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full px-3 py-2 bg-white border border-surface-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
        </div>
        {selectedSlot && selectedCourt && (
          <div className="bg-brand-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-brand-800">{selectedCourt.venueName} — {selectedCourt.name}</p>
            <p className="text-brand-600 text-xs mt-0.5">
              {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)} · {formatPrice(Number(selectedSlot.price))}
            </p>
          </div>
        )}
        <Button onClick={handleSubmit} disabled={!slotId || submitting} className="w-full flex items-center justify-center gap-2">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Booking</>}
        </Button>
      </div>
    </Modal>
  )
}
