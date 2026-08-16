import { createClient } from '@/lib/supabase'
import type { Area, Venue, Court, Slot, Booking, Review } from '@/types'

const supabase = createClient()

export async function fetchAreas(): Promise<Area[]> {
  const { data } = await supabase.from('areas').select('*').order('name')
  return data ?? []
}

export async function fetchVenues(): Promise<Venue[]> {
  const { data } = await supabase
    .from('venues')
    .select('*, area:areas(*), courts(*)')
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
  return (data ?? []).map(normalizeVenue)
}

export async function fetchVenueBySlug(slug: string): Promise<Venue | null> {
  const { data } = await supabase
    .from('venues')
    .select('*, area:areas(*), courts(*)')
    .eq('slug', slug)
    .single()
  return data ? normalizeVenue(data) : null
}

export async function fetchOwnerVenues(ownerId: string): Promise<Venue[]> {
  const { data } = await supabase
    .from('venues')
    .select('*, area:areas(*), courts(*)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(normalizeVenue)
}

export async function fetchSlots(courtId: string, date: string): Promise<Slot[]> {
  const { data } = await supabase
    .from('slots')
    .select('*')
    .eq('court_id', courtId)
    .eq('date', date)
    .order('start_time')
  return data ?? []
}

export async function fetchUserBookings(userId: string): Promise<Booking[]> {
  const { data } = await supabase
    .from('bookings')
    .select('*, venue:venues(*, area:areas(*)), court:courts(*), slot:slots(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(normalizeBooking)
}

export async function fetchOwnerBookings(ownerId: string): Promise<Booking[]> {
  const { data } = await supabase
    .from('bookings')
    .select('*, venue:venues!inner(*, area:areas(*)), court:courts(*), slot:slots(*), user:profiles!bookings_user_id_fkey(*)')
    .eq('venue.owner_id', ownerId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(normalizeBooking)
}

export async function fetchVenueReviews(venueId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*, user:profiles(*)')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function fetchBookingCount(): Promise<number> {
  const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
  return count ?? 0
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
