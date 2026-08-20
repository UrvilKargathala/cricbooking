'use client'

import { useEffect, useState } from 'react'
import { Lock, Repeat, Clock, CheckCircle2, XCircle, Calendar, Plus, Loader2, Sun, Sunset, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { fetchOwnerVenues, fetchSlots } from '@/lib/supabase-queries'
import { formatTime, formatPrice, cn } from '@/lib/utils'
import { DateSelector } from '@/components/booking/DateSelector'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/store/useToastStore'
import { Modal } from '@/components/ui/Modal'
import type { Court, Slot, Venue } from '@/types'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function isWeekend(dateStr: string) {
  const day = new Date(dateStr + 'T00:00:00').getDay()
  return day === 0 || day === 6
}

function isNightSlot(time: string) {
  const hour = parseInt(time.slice(0, 2))
  return hour >= 18 || hour < 6
}

function generateTimeSlots(openTime: string, closeTime: string, durationMins: number) {
  const slots: { start: string; end: string }[] = []
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  let currentMins = openH * 60 + openM
  const endMins = closeH * 60 + closeM

  while (currentMins + durationMins <= endMins) {
    const startH = Math.floor(currentMins / 60)
    const startM = currentMins % 60
    const endTotalMins = currentMins + durationMins
    const endH = Math.floor(endTotalMins / 60)
    const endM = endTotalMins % 60
    slots.push({
      start: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
      end: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
    })
    currentMins += durationMins
  }
  return slots
}

function GenerateSlotsModal({
  isOpen,
  onClose,
  court,
  venue,
  onGenerated,
}: {
  isOpen: boolean
  onClose: () => void
  court: Court
  venue: Venue
  onGenerated: () => void
}) {
  const [fromDate, setFromDate] = useState(todayStr())
  const [toDate, setToDate] = useState(addDays(todayStr(), 6))
  const [weekdayPrice, setWeekdayPrice] = useState(court.price_per_slot)
  const [weekendPrice, setWeekendPrice] = useState(court.weekend_price || court.price_per_slot)
  const [nightPrice, setNightPrice] = useState(court.night_price || court.price_per_slot)
  const [generating, setGenerating] = useState(false)
  const [skipExisting, setSkipExisting] = useState(true)
  const showToast = useToastStore((s) => s.showToast)

  const openTime = venue.opening_time?.slice(0, 5) || '06:00'
  const closeTime = venue.closing_time?.slice(0, 5) || '23:00'
  const duration = venue.slot_duration_mins || 60

  const timeSlots = generateTimeSlots(openTime, closeTime, duration)

  const getDatesInRange = () => {
    const dates: string[] = []
    let current = fromDate
    while (current <= toDate) {
      dates.push(current)
      current = addDays(current, 1)
    }
    return dates
  }

  const totalDays = getDatesInRange().length
  const totalSlots = totalDays * timeSlots.length

  const handleGenerate = async () => {
    setGenerating(true)
    const supabase = createClient()
    const dates = getDatesInRange()
    let created = 0
    let skipped = 0

    for (const date of dates) {
      if (skipExisting) {
        const { data: existing } = await supabase
          .from('slots')
          .select('start_time')
          .eq('court_id', court.id)
          .eq('date', date)
        const existingTimes = new Set((existing || []).map((s: { start_time: string }) => s.start_time.slice(0, 5)))

        const newSlots = timeSlots
          .filter((ts) => !existingTimes.has(ts.start))
          .map((ts) => {
            let price = weekdayPrice
            if (isWeekend(date) && weekendPrice) price = weekendPrice
            if (isNightSlot(ts.start) && nightPrice) price = nightPrice
            return {
              court_id: court.id,
              date,
              start_time: ts.start,
              end_time: ts.end,
              price,
              status: 'available' as const,
            }
          })

        skipped += timeSlots.length - newSlots.length
        if (newSlots.length > 0) {
          const { error } = await supabase.from('slots').insert(newSlots)
          if (!error) created += newSlots.length
        }
      } else {
        const newSlots = timeSlots.map((ts) => {
          let price = weekdayPrice
          if (isWeekend(date) && weekendPrice) price = weekendPrice
          if (isNightSlot(ts.start) && nightPrice) price = nightPrice
          return {
            court_id: court.id,
            date,
            start_time: ts.start,
            end_time: ts.end,
            price,
            status: 'available' as const,
          }
        })
        const { error } = await supabase.from('slots').insert(newSlots)
        if (!error) created += newSlots.length
      }
    }

    setGenerating(false)
    const msg = skipped > 0
      ? `Created ${created} slots (${skipped} already existed)`
      : `Created ${created} slots successfully!`
    showToast(msg, 'success')
    onGenerated()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Slots">
      <div className="flex flex-col gap-5">
        <div className="bg-brand-50 rounded-xl px-4 py-3 text-sm">
          <p className="font-medium text-brand-800">{court.name}</p>
          <p className="text-brand-600 text-xs mt-0.5">
            {venue.name} · {formatTime(openTime)} – {formatTime(closeTime)} · {duration} min slots
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-surface-700 block mb-2">Date Range</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-surface-500 block mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                min={todayStr()}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="text-xs text-surface-500 block mb-1">To</label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-surface-700 block mb-2">Pricing</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-surface-500 flex items-center gap-1 mb-1">
                <Sun className="w-3 h-3" /> Weekday
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">₹</span>
                <input
                  type="number"
                  value={weekdayPrice}
                  onChange={(e) => setWeekdayPrice(Number(e.target.value))}
                  className="w-full border border-surface-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-surface-500 flex items-center gap-1 mb-1">
                <Sunset className="w-3 h-3" /> Weekend
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">₹</span>
                <input
                  type="number"
                  value={weekendPrice}
                  onChange={(e) => setWeekendPrice(Number(e.target.value))}
                  className="w-full border border-surface-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-surface-500 flex items-center gap-1 mb-1">
                <Moon className="w-3 h-3" /> Night (6 PM+)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">₹</span>
                <input
                  type="number"
                  value={nightPrice}
                  onChange={(e) => setNightPrice(Number(e.target.value))}
                  className="w-full border border-surface-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-surface-700 block mb-2">Preview</label>
          <div className="bg-surface-50 rounded-xl p-3 max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {timeSlots.map((ts) => (
                <span
                  key={ts.start}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    isNightSlot(ts.start)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  )}
                >
                  {formatTime(ts.start)} – {formatTime(ts.end)}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-surface-500 mt-2">
            {timeSlots.length} slots/day × {totalDays} days = <span className="font-semibold text-surface-700">{totalSlots} total slots</span>
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
          <input
            type="checkbox"
            checked={skipExisting}
            onChange={(e) => setSkipExisting(e.target.checked)}
            className="rounded border-surface-300 text-brand-600 focus:ring-brand-400"
          />
          Skip slots that already exist (avoid duplicates)
        </label>

        <Button
          onClick={handleGenerate}
          disabled={generating || totalSlots === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Generate {totalSlots} Slots
            </>
          )}
        </Button>
      </div>
    </Modal>
  )
}

function SlotDetailModal({
  slot,
  onClose,
  onAction,
}: {
  slot: Slot | null
  onClose: () => void
  onAction: (action: string) => void
}) {
  if (!slot) return null

  return (
    <Modal isOpen={!!slot} onClose={onClose} title="Slot Details">
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-surface-500">Time</span>
          <span className="font-medium text-surface-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-surface-500">Price</span>
          <span className="font-semibold text-surface-900">{formatPrice(Number(slot.price))}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-surface-500">Status</span>
          <span className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full',
            slot.status === 'available' && 'bg-emerald-50 text-emerald-700',
            slot.status === 'booked' && 'bg-blue-50 text-blue-700',
            slot.status === 'blocked' && 'bg-red-50 text-red-700',
          )}>
            {slot.status[0].toUpperCase() + slot.status.slice(1)}
          </span>
        </div>

        {slot.status === 'blocked' && slot.blocked_reason && (
          <div className="border-t border-surface-100 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-surface-500">Reason</span>
              <span className="text-surface-700">{slot.blocked_reason}</span>
            </div>
          </div>
        )}

        <div className="border-t border-surface-100 pt-3 mt-1">
          {slot.status === 'available' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('block')}
              className="w-full flex items-center justify-center gap-1.5 !text-red-600 !border-red-200 hover:!bg-red-50"
            >
              <Lock className="w-3.5 h-3.5" />
              Block This Slot
            </Button>
          )}
          {slot.status === 'blocked' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('unblock')}
              className="w-full flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Unblock This Slot
            </Button>
          )}
          {slot.status === 'booked' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('cancel')}
              className="w-full flex items-center justify-center gap-1.5 !text-red-600 !border-red-200 hover:!bg-red-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default function DashboardSlotsPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [activeCourt, setActiveCourt] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [showGenerate, setShowGenerate] = useState(false)
  const [loading, setLoading] = useState(true)
  const showToast = useToastStore((s) => s.showToast)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const ownerVenues = await fetchOwnerVenues(user.id)
        setVenues(ownerVenues)
        const allCourts = ownerVenues.flatMap((v) => v.courts ?? [])
        setCourts(allCourts)
        if (allCourts.length > 0) setActiveCourt(allCourts[0].id)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!activeCourt) return
    fetchSlots(activeCourt, selectedDate).then(setSlots)
  }, [activeCourt, selectedDate])

  useEffect(() => {
    if (!activeCourt) return
    const supabase = createClient()
    const channel = supabase
      .channel(`owner-slots-${activeCourt}-${selectedDate}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slots', filter: `court_id=eq.${activeCourt}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSlots((prev) => prev.map((s) =>
              s.id === payload.new.id
                ? { ...s, status: payload.new.status, blocked_reason: payload.new.blocked_reason }
                : s
            ))
            showToast('Slot updated in real-time', 'info')
          } else if (payload.eventType === 'INSERT' && payload.new.date === selectedDate) {
            setSlots((prev) => {
              if (prev.some((s) => s.id === payload.new.id)) return prev
              return [...prev, payload.new as Slot].sort((a, b) => a.start_time.localeCompare(b.start_time))
            })
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeCourt, selectedDate, showToast])

  const activeCourtObj = courts.find((c) => c.id === activeCourt)
  const activeCourtName = activeCourtObj?.name ?? ''
  const activeVenue = venues.find((v) => v.courts?.some((c) => c.id === activeCourt))

  const availableCount = slots.filter((s) => s.status === 'available').length
  const bookedCount = slots.filter((s) => s.status === 'booked').length
  const blockedCount = slots.filter((s) => s.status === 'blocked').length
  const totalSlots = slots.length
  const occupancyPct = totalSlots > 0 ? Math.round((bookedCount / totalSlots) * 100) : 0

  const handleSlotAction = async (action: string) => {
    if (!selectedSlot) return
    const supabase = createClient()

    if (action === 'block') {
      await supabase.from('slots').update({ status: 'blocked', blocked_reason: 'Blocked by owner' }).eq('id', selectedSlot.id)
      showToast('Slot blocked successfully.', 'success')
    } else if (action === 'unblock') {
      await supabase.from('slots').update({ status: 'available', blocked_reason: null }).eq('id', selectedSlot.id)
      showToast('Slot unblocked.', 'info')
    } else if (action === 'cancel') {
      showToast('Booking cancellation coming soon.', 'info')
    }

    setSelectedSlot(null)
    if (activeCourt) fetchSlots(activeCourt, selectedDate).then(setSlots)
  }

  const handleSlotsGenerated = () => {
    if (activeCourt) fetchSlots(activeCourt, selectedDate).then(setSlots)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (courts.length === 0) {
    return (
      <div className="text-center py-20">
        <Calendar className="w-12 h-12 text-surface-200 mx-auto" />
        <p className="text-surface-500 mt-3 font-medium">No courts found</p>
        <p className="text-sm text-surface-400 mt-1">Add a venue with courts first to manage slots.</p>
      </div>
    )
  }

  const STATS = [
    { label: 'Total Slots', value: String(totalSlots), icon: Calendar, bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Available', value: String(availableCount), icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { label: 'Booked', value: String(bookedCount), icon: Clock, bg: 'bg-brand-100', text: 'text-brand-600' },
    { label: 'Blocked', value: String(blockedCount), icon: Lock, bg: 'bg-red-100', text: 'text-red-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-surface-900">Slot Management</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage availability and generate slots for your courts.</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate Slots
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast(`All ${availableCount} available slots on ${selectedDate} for ${activeCourtName} would be blocked.`, 'info')}
            className="flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Block Day
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showToast('Recurring block setting coming soon.', 'info')}
            className="flex items-center gap-1.5"
          >
            <Repeat className="w-3.5 h-3.5" />
            Recurring
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
          <div className="flex items-center gap-2 flex-wrap">
            {courts.map((court) => (
              <button
                key={court.id}
                onClick={() => setActiveCourt(court.id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  activeCourt === court.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                )}
              >
                {court.name}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3 text-sm text-surface-500">
              <span>Occupancy: <span className="font-semibold text-surface-900">{occupancyPct}%</span></span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-surface-100">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-900">
              {activeCourtName} — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </h2>
          </div>

          {slots.length > 0 ? (
            <div className="slot-grid">
              {slots.map((slot) => {
                const isBooked = slot.status === 'booked'
                const isBlocked = slot.status === 'blocked'

                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border text-xs transition-all',
                      isBooked && 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-sm',
                      isBlocked && 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-sm',
                      !isBooked && !isBlocked && 'bg-white border-surface-200 hover:border-brand-400 hover:bg-brand-50 hover:shadow-sm',
                    )}
                  >
                    <span className={cn(
                      'font-semibold',
                      isBooked && 'text-blue-800',
                      isBlocked && 'text-red-800',
                      !isBooked && !isBlocked && 'text-surface-900',
                    )}>
                      {formatTime(slot.start_time)}
                    </span>
                    <span className={cn(
                      'text-[10px] font-medium',
                      isBooked && 'text-blue-600',
                      isBlocked && 'text-red-600',
                      !isBooked && !isBlocked && 'text-surface-400',
                    )}>
                      {isBooked ? 'Booked' : isBlocked ? 'Blocked' : formatPrice(Number(slot.price))}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-surface-500">No slots found for this date.</p>
              <button
                onClick={() => setShowGenerate(true)}
                className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Generate slots for this court →
              </button>
            </div>
          )}

          <div className="flex gap-5 mt-5 pt-4 border-t border-surface-100 text-xs text-surface-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-surface-200 bg-white" />
              Available — click to block
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
              Booked — click for details
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
              Blocked — click to unblock
            </span>
          </div>
        </div>
      </div>

      <SlotDetailModal
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onAction={handleSlotAction}
      />

      {activeCourtObj && activeVenue && (
        <GenerateSlotsModal
          isOpen={showGenerate}
          onClose={() => setShowGenerate(false)}
          court={activeCourtObj}
          venue={activeVenue}
          onGenerated={handleSlotsGenerated}
        />
      )}
    </div>
  )
}
