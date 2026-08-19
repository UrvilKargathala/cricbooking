'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, Clock, MapPin, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatPrice, formatTime } from '@/lib/utils'
import type { Slot, Venue } from '@/types'

interface Recommendation {
  venue: Venue
  slot: Slot
  reason: string
}

export function SmartRecommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyze()
  }, [])

  async function analyze() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, venue:venues(*, area:areas(*)), slot:slots(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!bookings || bookings.length === 0) {
      await suggestPopular(supabase)
      return
    }

    const dayFreq: Record<number, number> = {}
    const hourFreq: Record<number, number> = {}
    const areaFreq: Record<string, number> = {}
    const venueFreq: Record<string, number> = {}

    for (const b of bookings) {
      if (b.slot?.date) {
        const day = new Date(b.slot.date).getDay()
        dayFreq[day] = (dayFreq[day] || 0) + 1
      }
      if (b.slot?.start_time) {
        const hour = parseInt(b.slot.start_time.slice(0, 2))
        hourFreq[hour] = (hourFreq[hour] || 0) + 1
      }
      if (b.venue?.area?.slug) {
        areaFreq[b.venue.area.slug] = (areaFreq[b.venue.area.slug] || 0) + 1
      }
      if (b.venue_id) {
        venueFreq[b.venue_id] = (venueFreq[b.venue_id] || 0) + 1
      }
    }

    const topDay = Object.entries(dayFreq).sort((a, b) => b[1] - a[1])[0]?.[0]
    const topHour = Object.entries(hourFreq).sort((a, b) => b[1] - a[1])[0]?.[0]
    const topVenue = Object.entries(venueFreq).sort((a, b) => b[1] - a[1])[0]?.[0]

    const today = new Date()
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + i)
      if (topDay !== undefined && d.getDay() === Number(topDay)) {
        dates.push(d.toISOString().slice(0, 10))
      }
      if (dates.length === 0 && i < 3) {
        dates.push(d.toISOString().slice(0, 10))
      }
    }
    if (dates.length === 0) dates.push(today.toISOString().slice(0, 10))

    const { data: slots } = await supabase
      .from('slots')
      .select('*, court:courts(*, venue:venues(*, area:areas(*)))')
      .in('date', dates)
      .eq('status', 'available')
      .order('date')
      .order('start_time')
      .limit(50)

    if (!slots || slots.length === 0) {
      await suggestPopular(supabase)
      return
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const scored = slots.map((slot) => {
      let score = 0
      let reason = ''
      const slotDay = new Date(slot.date).getDay()
      const slotHour = parseInt(slot.start_time.slice(0, 2))

      if (topDay !== undefined && slotDay === Number(topDay)) {
        score += 3
        reason = `You usually play on ${dayNames[slotDay]}s`
      }
      if (topHour !== undefined && Math.abs(slotHour - Number(topHour)) <= 1) {
        score += 2
        reason = reason ? `${reason} around this time` : `Matches your preferred time`
      }
      if (topVenue && slot.court?.venue?.id === topVenue) {
        score += 2
        reason = reason || 'Your favourite venue'
      }

      return { slot, score, reason: reason || 'Available near you' }
    }).filter((s) => s.score > 0)

    scored.sort((a, b) => b.score - a.score)

    const results: Recommendation[] = scored.slice(0, 3).map((s) => ({
      venue: s.slot.court?.venue as Venue,
      slot: s.slot,
      reason: s.reason,
    })).filter((r) => r.venue)

    setRecs(results)
    setLoading(false)
  }

  async function suggestPopular(supabase: ReturnType<typeof createClient>) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const date = tomorrow.toISOString().slice(0, 10)

    const { data: slots } = await supabase
      .from('slots')
      .select('*, court:courts(*, venue:venues(*, area:areas(*)))')
      .eq('date', date)
      .eq('status', 'available')
      .gte('start_time', '17:00')
      .lte('start_time', '21:00')
      .order('start_time')
      .limit(3)

    if (slots && slots.length > 0) {
      setRecs(slots.map((s) => ({
        venue: s.court?.venue as Venue,
        slot: s,
        reason: 'Popular evening slot',
      })).filter((r) => r.venue))
    }
    setLoading(false)
  }

  if (loading || recs.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-600" />
        </div>
        <h2 className="font-display font-bold text-xl text-surface-900">Recommended for You</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recs.map((rec) => (
          <Link
            key={rec.slot.id}
            href={`/venues/${rec.venue.slug}#book-a-slot`}
            className="group bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200/60 p-5 hover:shadow-md hover:border-amber-300 transition-all"
          >
            <p className="text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2.5 py-1 inline-block mb-3">
              <Sparkles className="w-3 h-3 inline -mt-0.5 mr-1" />
              {rec.reason}
            </p>
            <h3 className="font-display font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
              {rec.venue.name}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-surface-800/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(rec.slot.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(rec.slot.start_time)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-100">
              <span className="flex items-center gap-1 text-xs text-surface-800/50">
                <MapPin className="w-3 h-3" />
                {rec.venue.area?.name || 'Surat'}
              </span>
              <span className="font-display font-semibold text-brand-700">{formatPrice(rec.slot.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
