export type UserRole = 'user' | 'owner' | 'admin'
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type BookingSource = 'online' | 'walkin' | 'phone'
export type SlotStatus = 'available' | 'booked' | 'blocked'
export type VenueStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type SurfaceType = 'turf' | 'mat' | 'cement' | 'natural_grass' | 'synthetic'
export type SportType = 'box_cricket' | 'cricket' | 'football' | 'badminton' | 'tennis' | 'multi_sport'

export interface Profile {
  id: string; full_name: string; phone: string | null; email: string | null
  avatar_url: string | null; role: UserRole; area: string | null; city: string; created_at: string
}
export interface Area { id: number; name: string; slug: string; image?: string }
export interface Venue {
  id: string; owner_id: string; name: string; slug: string; description: string | null
  address: string; area_id: number | null; city: string; phone: string | null
  cover_image: string | null; images: string[]; amenities: string[]; sports: SportType[]
  opening_time: string; closing_time: string; slot_duration_mins: number
  min_advance_hours: number; max_advance_days: number; cancellation_hours: number
  cancellation_refund_pct: number; rating: number; total_reviews: number
  status: VenueStatus; is_featured: boolean; created_at: string
  area?: Area; courts?: Court[]
}
export interface Court {
  id: string; venue_id: string; name: string; surface: SurfaceType; sport: SportType
  max_players: number; dimensions: string | null; price_per_slot: number
  weekend_price: number | null; night_price: number | null; is_active: boolean
}
export interface Slot {
  id: string; court_id: string; date: string; start_time: string; end_time: string
  price: number; status: SlotStatus; blocked_reason: string | null
}
export interface Booking {
  id: string; booking_code: string; user_id: string | null; venue_id: string
  court_id: string; slot_id: string; booked_by: string; source: BookingSource
  customer_name: string | null; customer_phone: string | null; amount: number
  payment_status: string; status: BookingStatus; notes: string | null; created_at: string
  venue?: Venue; court?: Court; slot?: Slot; user?: Profile
}
export interface Review {
  id: string; user_id: string; venue_id: string; rating: number
  comment: string | null; created_at: string; user?: Profile
}

export interface CourtFormData {
  id: string
  name: string
  surface: SurfaceType
  sport: SportType
  max_players: number
  dimensions: string
  price_per_slot: number
  weekend_price: number
  night_price: number
}

export interface VenueFormData {
  name: string
  address: string
  area: string
  phone: string
  description: string
  photos: File[]
  courts: CourtFormData[]
  sports: SportType[]
  amenities: string[]
  opening_time: string
  closing_time: string
  slot_duration: number
  min_advance_hours: number
  max_advance_days: number
  cancellation_hours: number
  cancellation_refund_pct: number
}
