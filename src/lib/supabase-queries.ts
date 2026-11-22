import { createClient } from '@/lib/supabase'
import type { Area, Venue, Court, Slot, Booking, Review } from '@/types'

const supabase = createClient()

export async function fetchAreas(): Promise<Area[]> {
  const { data, error } = await supabase.from('areas').select('*').order('name')
  if (error) throw new Error(`Failed to load areas: ${error.message}`)
  return data ?? []
}

export async function fetchVenues(): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*, area:areas(*), courts(*)')
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
  if (error) throw new Error(`Failed to load venues: ${error.message}`)
  return (data ?? []).map(normalizeVenue)
}

export async function fetchVenueBySlug(slug: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*, area:areas(*), courts(*)')
    .eq('slug', slug)
    .single()
  if (error && error.code !== 'PGRST116') throw new Error(`Failed to load venue: ${error.message}`)
  return data ? normalizeVenue(data) : null
}

export async function fetchOwnerVenues(ownerId: string): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*, area:areas(*), courts(*)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to load owner venues: ${error.message}`)
  return (data ?? []).map(normalizeVenue)
}

export async function fetchSlots(courtId: string, date: string): Promise<Slot[]> {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('court_id', courtId)
    .eq('date', date)
    .order('start_time')
  if (error) throw new Error(`Failed to load slots: ${error.message}`)
  return data ?? []
}

export async function fetchUserBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, venue:venues(*, area:areas(*)), court:courts(*), slot:slots(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to load bookings: ${error.message}`)
  return (data ?? []).map(normalizeBooking)
}

export async function fetchBookingsByCodes(codes: string[]): Promise<Booking[]> {
  if (codes.length === 0) return []
  const { data, error } = await supabase
    .from('bookings')
    .select('*, venue:venues(*, area:areas(*)), court:courts(*), slot:slots(*)')
    .in('booking_code', codes)
  if (error) throw new Error(`Failed to load bookings: ${error.message}`)
  return (data ?? []).map(normalizeBooking)
}

export async function fetchOwnerBookings(ownerId: string): Promise<Booking[]> {
  const authed = await supabase.auth.getUser()
  if (authed.data.user?.id !== ownerId) return []
  const { data, error } = await supabase
    .from('bookings')
    .select('*, venue:venues!inner(*, area:areas(*)), court:courts(*), slot:slots(*), user:profiles!bookings_user_id_fkey(*)')
    .eq('venue.owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to load owner bookings: ${error.message}`)
  return (data ?? []).map(normalizeBooking)
}

export async function fetchVenueReviews(venueId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to load reviews: ${error.message}`)
  const reviews = data ?? []
  const userIds = Array.from(new Set(reviews.map((r) => r.user_id).filter(Boolean)))
  if (!userIds.length) return reviews
  const { data: names } = await supabase.rpc('get_profile_names', { ids: userIds })
  const byId = new Map(((names ?? []) as { id: string; full_name: string }[]).map((n) => [n.id, n.full_name]))
  return reviews.map((r) => ({ ...r, user: { full_name: byId.get(r.user_id) || 'Player' } }))
}

export async function fetchBookingCount(): Promise<number> {
  const { count, error } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
  if (error) throw new Error(`Failed to load booking count: ${error.message}`)
  return count ?? 0
}

export interface VenueSlotInfo {
  available: number
  date: string
  isToday: boolean
  slots: { start: string; end: string; status: string }[]
}

export async function fetchTodaySlotCounts(): Promise<Record<string, VenueSlotInfo>> {
  const { date: today, time: now } = indiaNow()

  // Try today first
  const { data, error } = await supabase
    .from('slots')
    .select('court_id, start_time, end_time, status, date, court:courts!inner(venue_id)')
    .gte('date', today)
    .eq('status', 'available')
    .order('date')
    .order('start_time')

  if (error || !data?.length) return {}

  const result: Record<string, VenueSlotInfo> = {}
  for (const slot of data) {
    const venueId = (slot.court as unknown as { venue_id: string }).venue_id
    const isToday = slot.date === today
    if (isToday && slot.start_time < now) continue

    if (!result[venueId]) {
      result[venueId] = { available: 0, date: slot.date, isToday, slots: [] }
    }
    // Only show slots for the earliest available date per venue
    if (slot.date !== result[venueId].date) continue

    result[venueId].available++
    result[venueId].slots.push({ start: slot.start_time, end: slot.end_time, status: slot.status })
  }
  return result
}

function normalizeVenue(raw: Record<string, unknown>): Venue {
  return {
    ...raw,
    sports: Array.isArray(raw.sports) ? raw.sports : parsePgArray(raw.sports as string),
    amenities: Array.isArray(raw.amenities) ? raw.amenities : parsePgArray(raw.amenities as string),
    images: Array.isArray(raw.images) ? raw.images : parsePgArray(raw.images as string),
    rating: Number(raw.rating) || 0,
    courts: Array.isArray(raw.courts)
      ? raw.courts.map((c: Record<string, unknown>) => ({
          ...c,
          price_per_slot: Number(c.price_per_slot) || 0,
          weekend_price: c.weekend_price ? Number(c.weekend_price) : null,
          night_price: c.night_price ? Number(c.night_price) : null,
        }))
      : [],
  } as Venue
}

function normalizeBooking(raw: Record<string, unknown>): Booking {
  const b = { ...raw, amount: Number(raw.amount) || 0 } as Booking
  if (b.venue) Object.assign(b, { venue: normalizeVenue(b.venue as unknown as Record<string, unknown>) })
  if (b.court) {
    const c = b.court as unknown as Record<string, unknown>
    b.court = { ...c, price_per_slot: Number(c.price_per_slot) || 0, weekend_price: c.weekend_price ? Number(c.weekend_price) : null, night_price: c.night_price ? Number(c.night_price) : null } as Court
  }
  return b
}

function parsePgArray(val: string | null | undefined): string[] {
  if (!val || val === '{}') return []
  return val.replace(/^\{|\}$/g, '').split(',').filter(Boolean)
}

export async function fetchOpenSlotCountsByDate(courtIds: string[], fromDate: string, toDate: string): Promise<{ date: string; start_time: string }[]> {
  if (!courtIds.length) return []
  const { data, error } = await supabase
    .from('slots')
    .select('date, start_time')
    .in('court_id', courtIds)
    .eq('status', 'available')
    .gte('date', fromDate)
    .lte('date', toDate)
  if (error) throw new Error(`Failed to load slot counts: ${error.message}`)
  return data ?? []
}

function indiaNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value])
  )
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}:${parts.second}` }
}

export interface ReviewStats {
  average: number
  count: number
}

export async function fetchReviewStats(): Promise<Record<string, ReviewStats>> {
  const { data, error } = await supabase.from('reviews').select('venue_id, rating')
  if (error) throw new Error(`Failed to load review stats: ${error.message}`)
  const totals: Record<string, { sum: number; count: number }> = {}
  for (const row of data ?? []) {
    const entry = (totals[row.venue_id] ??= { sum: 0, count: 0 })
    entry.sum += Number(row.rating) || 0
    entry.count += 1
  }
  return Object.fromEntries(
    Object.entries(totals).map(([venueId, { sum, count }]) => [venueId, { average: sum / count, count }])
  )
}
