import type { Area, Venue, Court, Slot, Booking, Profile } from '@/types'

export const DEMO_AREAS: Area[] = [
  { id: 1, name: 'Vesu', slug: 'vesu', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600' },
  { id: 2, name: 'Adajan', slug: 'adajan', image: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=600' },
  { id: 3, name: 'Varachha', slug: 'varachha', image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=600' },
  { id: 4, name: 'Katargam', slug: 'katargam', image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=600' },
  { id: 5, name: 'Piplod', slug: 'piplod', image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=600' },
  { id: 6, name: 'Dumas', slug: 'dumas', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600' },
  { id: 7, name: 'Athwa', slug: 'athwa', image: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=600' },
  { id: 8, name: 'Pal', slug: 'pal', image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=600' },
  { id: 9, name: 'City Light', slug: 'city-light', image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=600' },
  { id: 10, name: 'Ring Road', slug: 'ring-road', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600' },
]

const areaBySlug = (slug: string) => DEMO_AREAS.find((a) => a.slug === slug)!

const courtsByVenue: Record<string, Court[]> = {
  'v1': [
    { id: 'c1', venue_id: 'v1', name: 'Box-1 Turf', surface: 'turf', sport: 'box_cricket', max_players: 12, dimensions: '110x60 ft', price_per_slot: 800, weekend_price: 1000, night_price: 1200, is_active: true },
    { id: 'c2', venue_id: 'v1', name: 'Box-2 Mat', surface: 'mat', sport: 'cricket', max_players: 12, dimensions: '100x50 ft', price_per_slot: 600, weekend_price: 800, night_price: 900, is_active: true },
  ],
  'v2': [
    { id: 'c3', venue_id: 'v2', name: 'Turf A', surface: 'turf', sport: 'box_cricket', max_players: 12, dimensions: '100x50 ft', price_per_slot: 600, weekend_price: 800, night_price: null, is_active: true },
  ],
  'v3': [
    { id: 'c4', venue_id: 'v3', name: 'Box-1', surface: 'turf', sport: 'box_cricket', max_players: 12, dimensions: '110x60 ft', price_per_slot: 700, weekend_price: 900, night_price: 1000, is_active: true },
    { id: 'c5', venue_id: 'v3', name: 'Ground-1', surface: 'turf', sport: 'football', max_players: 14, dimensions: '130x70 ft', price_per_slot: 1000, weekend_price: 1200, night_price: null, is_active: true },
  ],
  'v4': [
    { id: 'c6', venue_id: 'v4', name: 'Ground-1', surface: 'natural_grass', sport: 'cricket', max_players: 22, dimensions: '180x150 ft', price_per_slot: 1500, weekend_price: 2000, night_price: null, is_active: true },
  ],
  'v5': [
    { id: 'c7', venue_id: 'v5', name: 'Beach Ground', surface: 'natural_grass', sport: 'cricket', max_players: 16, dimensions: '120x80 ft', price_per_slot: 1200, weekend_price: 1500, night_price: null, is_active: true },
  ],
  'v6': [
    { id: 'c8', venue_id: 'v6', name: 'Box-1', surface: 'turf', sport: 'box_cricket', max_players: 12, dimensions: '100x50 ft', price_per_slot: 900, weekend_price: 1100, night_price: 1300, is_active: true },
  ],
}

export const DEMO_VENUES: Venue[] = [
  {
    id: 'v1', owner_id: 'o1', name: 'Surat Cricket Arena', slug: 'surat-cricket-arena',
    description: 'Premium box cricket arena with dual turf and mat courts, floodlit for night matches.',
    address: 'Near VR Mall, Dumas Road, Vesu, Surat', area_id: 1, city: 'Surat', phone: '+919825012345',
    cover_image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    images: [], amenities: ['parking', 'lighting', 'drinking_water', 'restrooms', 'seating', 'changing_room', 'first_aid'],
    sports: ['box_cricket', 'cricket'], opening_time: '06:00', closing_time: '23:00', slot_duration_mins: 60,
    min_advance_hours: 2, max_advance_days: 14, cancellation_hours: 4, cancellation_refund_pct: 80,
    rating: 4.5, total_reviews: 128, status: 'approved', is_featured: true, created_at: '2025-01-10T00:00:00Z',
    area: areaBySlug('vesu'), courts: courtsByVenue['v1'],
  },
  {
    id: 'v2', owner_id: 'o2', name: 'Champion Turf Ground', slug: 'champion-turf-ground',
    description: 'Compact single-court turf ground, popular for evening corporate matches.',
    address: 'Opp. Iskcon Temple, Adajan Road, Adajan, Surat', area_id: 2, city: 'Surat', phone: '+919825023456',
    cover_image: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800',
    images: [], amenities: ['parking', 'lighting', 'seating'],
    sports: ['box_cricket'], opening_time: '07:00', closing_time: '22:00', slot_duration_mins: 60,
    min_advance_hours: 1, max_advance_days: 7, cancellation_hours: 2, cancellation_refund_pct: 50,
    rating: 4.2, total_reviews: 67, status: 'approved', is_featured: false, created_at: '2025-02-14T00:00:00Z',
    area: areaBySlug('adajan'), courts: courtsByVenue['v2'],
  },
  {
    id: 'v3', owner_id: 'o1', name: 'Green Pitch Sports', slug: 'green-pitch-sports',
    description: 'Multi-sport facility with box cricket and a full-size football ground.',
    address: 'Near Kapodra Circle, Varachha Road, Varachha, Surat', area_id: 3, city: 'Surat', phone: '+919825034567',
    cover_image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800',
    images: [], amenities: ['parking', 'drinking_water', 'changing_room', 'cafe'],
    sports: ['box_cricket', 'football'], opening_time: '06:00', closing_time: '23:00', slot_duration_mins: 60,
    min_advance_hours: 2, max_advance_days: 14, cancellation_hours: 6, cancellation_refund_pct: 100,
    rating: 4.7, total_reviews: 203, status: 'approved', is_featured: true, created_at: '2024-11-05T00:00:00Z',
    area: areaBySlug('varachha'), courts: courtsByVenue['v3'],
  },
  {
    id: 'v4', owner_id: 'o3', name: 'Piplod Sports Hub', slug: 'piplod-sports-hub',
    description: 'Full-size natural grass cricket ground for serious league matches.',
    address: 'Behind Piplod Garden, Piplod, Surat', area_id: 5, city: 'Surat', phone: '+919825045678',
    cover_image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=800',
    images: [], amenities: ['parking', 'lighting'],
    sports: ['cricket'], opening_time: '06:00', closing_time: '22:00', slot_duration_mins: 60,
    min_advance_hours: 3, max_advance_days: 10, cancellation_hours: 6, cancellation_refund_pct: 50,
    rating: 3.9, total_reviews: 34, status: 'approved', is_featured: false, created_at: '2025-03-20T00:00:00Z',
    area: areaBySlug('piplod'), courts: courtsByVenue['v4'],
  },
  {
    id: 'v5', owner_id: 'o3', name: 'Dumas Beach Cricket', slug: 'dumas-beach-cricket',
    description: 'Scenic beachside cricket ground near Dumas, great for weekend games.',
    address: 'Dumas Beach Road, Dumas, Surat', area_id: 6, city: 'Surat', phone: '+919825056789',
    cover_image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    images: [], amenities: ['parking', 'restrooms', 'seating'],
    sports: ['cricket'], opening_time: '06:00', closing_time: '21:00', slot_duration_mins: 90,
    min_advance_hours: 2, max_advance_days: 7, cancellation_hours: 4, cancellation_refund_pct: 50,
    rating: 4.0, total_reviews: 45, status: 'approved', is_featured: false, created_at: '2025-04-01T00:00:00Z',
    area: areaBySlug('dumas'), courts: courtsByVenue['v5'],
  },
  {
    id: 'v6', owner_id: 'o4', name: 'Athwa Box Cricket Zone', slug: 'athwa-box-cricket-zone',
    description: 'Neighborhood box cricket favorite with equipment rental on site.',
    address: 'Near Athwa Gate, Athwalines, Surat', area_id: 7, city: 'Surat', phone: '+919825067890',
    cover_image: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800',
    images: [], amenities: ['lighting', 'drinking_water', 'equipment'],
    sports: ['box_cricket'], opening_time: '06:00', closing_time: '23:00', slot_duration_mins: 60,
    min_advance_hours: 1, max_advance_days: 7, cancellation_hours: 2, cancellation_refund_pct: 50,
    rating: 4.3, total_reviews: 89, status: 'approved', is_featured: false, created_at: '2025-05-12T00:00:00Z',
    area: areaBySlug('athwa'), courts: courtsByVenue['v6'],
  },
]

function seededRandom(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return () => {
    h = (h * 1103515245 + 12345) >>> 0
    return (h >>> 8) / 0x1000000
  }
}

export function generateDemoSlots(courtId: string, date: string): Slot[] {
  const court = Object.values(courtsByVenue).flat().find((c) => c.id === courtId)
  const basePrice = court?.price_per_slot ?? 700
  const nightPrice = court?.night_price ?? basePrice
  const rand = seededRandom(`${courtId}-${date}`)

  const slots: Slot[] = []
  for (let hour = 6; hour < 23; hour++) {
    const start = `${String(hour).padStart(2, '0')}:00`
    const end = `${String(hour + 1).padStart(2, '0')}:00`
    slots.push({
      id: `${courtId}-${date}-${hour}`,
      court_id: courtId,
      date,
      start_time: start,
      end_time: end,
      price: hour >= 18 ? nightPrice : basePrice,
      status: 'available',
      blocked_reason: null,
    })
  }

  const bookedCount = 3 + Math.floor(rand() * 2)
  const usedIndices = new Set<number>()
  for (let i = 0; i < bookedCount; i++) {
    const idx = Math.floor(rand() * slots.length)
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx)
      slots[idx].status = 'booked'
    }
  }
  let blockedIdx = Math.floor(rand() * slots.length)
  while (usedIndices.has(blockedIdx)) blockedIdx = Math.floor(rand() * slots.length)
  slots[blockedIdx].status = 'blocked'
  slots[blockedIdx].blocked_reason = 'Maintenance'

  return slots
}

const venueById = (id: string) => DEMO_VENUES.find((v) => v.id === id)!
const courtById = (id: string) => Object.values(courtsByVenue).flat().find((c) => c.id === id)!

function demoSlot(id: string, courtId: string, date: string, start: string, end: string, price: number): Slot {
  return { id, court_id: courtId, date, start_time: start, end_time: end, price, status: 'booked', blocked_reason: null }
}

export const DEMO_USER_BOOKINGS: Booking[] = [
  {
    id: 'b1', booking_code: 'CB-260728-4F9A', user_id: 'u1', venue_id: 'v1', court_id: 'c1', slot_id: 's1',
    booked_by: 'u1', source: 'online', customer_name: 'Rohan Patel', customer_phone: '+919825011111',
    amount: 1200, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-20T10:00:00Z',
    venue: venueById('v1'), court: courtById('c1'), slot: demoSlot('s1', 'c1', '2026-07-28', '19:00', '20:00', 1200),
  },
  {
    id: 'b2', booking_code: 'CB-260730-7B2C', user_id: 'u1', venue_id: 'v3', court_id: 'c5', slot_id: 's2',
    booked_by: 'u1', source: 'online', customer_name: 'Rohan Patel', customer_phone: '+919825011111',
    amount: 1000, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-22T14:00:00Z',
    venue: venueById('v3'), court: courtById('c5'), slot: demoSlot('s2', 'c5', '2026-07-30', '17:00', '18:00', 1000),
  },
  {
    id: 'b3', booking_code: 'CB-260802-1D5E', user_id: 'u1', venue_id: 'v6', court_id: 'c8', slot_id: 's3',
    booked_by: 'u1', source: 'online', customer_name: 'Rohan Patel', customer_phone: '+919825011111',
    amount: 900, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-24T09:00:00Z',
    venue: venueById('v6'), court: courtById('c8'), slot: demoSlot('s3', 'c8', '2026-08-02', '08:00', '09:00', 900),
  },
  {
    id: 'b4', booking_code: 'CB-260710-9A3F', user_id: 'u1', venue_id: 'v2', court_id: 'c3', slot_id: 's4',
    booked_by: 'u1', source: 'online', customer_name: 'Rohan Patel', customer_phone: '+919825011111',
    amount: 600, payment_status: 'paid', status: 'completed', notes: null, created_at: '2026-07-05T12:00:00Z',
    venue: venueById('v2'), court: courtById('c3'), slot: demoSlot('s4', 'c3', '2026-07-10', '18:00', '19:00', 600),
  },
  {
    id: 'b5', booking_code: 'CB-260715-2C8B', user_id: 'u1', venue_id: 'v1', court_id: 'c2', slot_id: 's5',
    booked_by: 'u1', source: 'online', customer_name: 'Rohan Patel', customer_phone: '+919825011111',
    amount: 800, payment_status: 'refunded', status: 'cancelled', notes: 'Rained out', created_at: '2026-07-12T08:00:00Z',
    venue: venueById('v1'), court: courtById('c2'), slot: demoSlot('s5', 'c2', '2026-07-15', '20:00', '21:00', 800),
  },
]

export interface Testimonial {
  id: string
  name: string
  area: string
  rating: number
  comment: string
  venue_name: string
}

export const DEMO_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Rohan Patel',
    area: 'Vesu',
    rating: 5,
    comment: 'Booked a slot in under a minute. No more calling five different turfs to check availability — this just works.',
    venue_name: 'Surat Cricket Arena',
  },
  {
    id: 't2',
    name: 'Priya Trivedi',
    area: 'Adajan',
    rating: 5,
    comment: 'Our office group plays every Sunday now. The slot picker makes it so easy to see what is free before we commit.',
    venue_name: 'Champion Turf Ground',
  },
  {
    id: 't3',
    name: 'Kunal Shah',
    area: 'Varachha',
    rating: 4,
    comment: 'Good variety of grounds near Varachha. Prices are clearly listed upfront, no surprises when we show up.',
    venue_name: 'Green Pitch Sports',
  },
]

export const DEMO_OWNER_BOOKINGS: Booking[] = [
  { id: 'ob1', booking_code: 'CB-260726-A1B1', user_id: 'u2', venue_id: 'v1', court_id: 'c1', slot_id: 'os1', booked_by: 'u2', source: 'online', customer_name: 'Kunal Shah', customer_phone: '+919825111111', amount: 1200, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-24T10:00:00Z', venue: venueById('v1'), court: courtById('c1'), slot: demoSlot('os1', 'c1', '2026-07-26', '19:00', '20:00', 1200) },
  { id: 'ob2', booking_code: 'CB-260726-A2B2', user_id: null, venue_id: 'v1', court_id: 'c2', slot_id: 'os2', booked_by: 'owner', source: 'walkin', customer_name: 'Manav Desai', customer_phone: '+919825222222', amount: 800, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-26T11:00:00Z', venue: venueById('v1'), court: courtById('c2'), slot: demoSlot('os2', 'c2', '2026-07-26', '11:00', '12:00', 800) },
  { id: 'ob3', booking_code: 'CB-260727-A3B3', user_id: 'u3', venue_id: 'v1', court_id: 'c1', slot_id: 'os3', booked_by: 'u3', source: 'online', customer_name: 'Priya Trivedi', customer_phone: '+919825333333', amount: 1000, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-25T09:00:00Z', venue: venueById('v1'), court: courtById('c1'), slot: demoSlot('os3', 'c1', '2026-07-27', '10:00', '11:00', 1000) },
  { id: 'ob4', booking_code: 'CB-260727-A4B4', user_id: null, venue_id: 'v1', court_id: 'c2', slot_id: 'os4', booked_by: 'owner', source: 'phone', customer_name: 'Jignesh Modi', customer_phone: '+919825444444', amount: 600, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-25T15:00:00Z', venue: venueById('v1'), court: courtById('c2'), slot: demoSlot('os4', 'c2', '2026-07-27', '07:00', '08:00', 600) },
  { id: 'ob5', booking_code: 'CB-260728-A5B5', user_id: 'u4', venue_id: 'v1', court_id: 'c1', slot_id: 'os5', booked_by: 'u4', source: 'online', customer_name: 'Aarav Bhatt', customer_phone: '+919825555555', amount: 1200, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-24T18:00:00Z', venue: venueById('v1'), court: courtById('c1'), slot: demoSlot('os5', 'c1', '2026-07-28', '21:00', '22:00', 1200) },
  { id: 'ob6', booking_code: 'CB-260722-A6B6', user_id: null, venue_id: 'v1', court_id: 'c2', slot_id: 'os6', booked_by: 'owner', source: 'walkin', customer_name: 'Sameer Pathan', customer_phone: '+919825666666', amount: 600, payment_status: 'paid', status: 'cancelled', notes: 'Customer no-show request', created_at: '2026-07-20T09:00:00Z', venue: venueById('v1'), court: courtById('c2'), slot: demoSlot('os6', 'c2', '2026-07-22', '06:00', '07:00', 600) },
  { id: 'ob7', booking_code: 'CB-260718-A7B7', user_id: 'u5', venue_id: 'v1', court_id: 'c1', slot_id: 'os7', booked_by: 'u5', source: 'online', customer_name: 'Nirav Joshi', customer_phone: '+919825777777', amount: 800, payment_status: 'paid', status: 'completed', notes: null, created_at: '2026-07-15T13:00:00Z', venue: venueById('v1'), court: courtById('c1'), slot: demoSlot('os7', 'c1', '2026-07-18', '17:00', '18:00', 800) },
  { id: 'ob8', booking_code: 'CB-260729-A8B8', user_id: null, venue_id: 'v1', court_id: 'c2', slot_id: 'os8', booked_by: 'owner', source: 'phone', customer_name: 'Yash Rana', customer_phone: '+919825888888', amount: 900, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-26T08:00:00Z', venue: venueById('v1'), court: courtById('c2'), slot: demoSlot('os8', 'c2', '2026-07-29', '19:00', '20:00', 900) },
]

export const DEMO_ADMIN_VENUES: (Venue & { owner_name: string })[] = [
  { ...venueById('v1'), owner_name: 'Rakesh Patel' },
  { ...venueById('v3'), owner_name: 'Rakesh Patel' },
  {
    ...venueById('v4'), status: 'pending', owner_name: 'Bhavesh Solanki',
  },
  {
    ...venueById('v2'), status: 'rejected', owner_name: 'Ketan Mehta',
  },
]

export const DEMO_ADMIN_USERS: Profile[] = [
  { id: 'u1', full_name: 'Rohan Patel', phone: '+919825011111', email: 'rohan.patel@example.com', avatar_url: null, role: 'user', area: 'Vesu', city: 'Surat', created_at: '2025-01-15T00:00:00Z' },
  { id: 'u2', full_name: 'Kunal Shah', phone: '+919825111111', email: 'kunal.shah@example.com', avatar_url: null, role: 'user', area: 'Adajan', city: 'Surat', created_at: '2025-02-10T00:00:00Z' },
  { id: 'u3', full_name: 'Priya Trivedi', phone: '+919825333333', email: 'priya.trivedi@example.com', avatar_url: null, role: 'user', area: 'Varachha', city: 'Surat', created_at: '2025-03-05T00:00:00Z' },
  { id: 'u4', full_name: 'Aarav Bhatt', phone: '+919825555555', email: 'aarav.bhatt@example.com', avatar_url: null, role: 'user', area: 'Piplod', city: 'Surat', created_at: '2025-04-20T00:00:00Z' },
  { id: 'u5', full_name: 'Nirav Joshi', phone: '+919825777777', email: 'nirav.joshi@example.com', avatar_url: null, role: 'user', area: 'Athwa', city: 'Surat', created_at: '2025-05-11T00:00:00Z' },
  { id: 'u6', full_name: 'Devansh Gandhi', phone: '+919825999999', email: 'devansh.gandhi@example.com', avatar_url: null, role: 'user', area: 'City Light', city: 'Surat', created_at: '2025-06-01T00:00:00Z' },
  { id: 'u7', full_name: 'Meera Shukla', phone: '+919825101010', email: 'meera.shukla@example.com', avatar_url: null, role: 'user', area: 'Pal', city: 'Surat', created_at: '2025-06-18T00:00:00Z' },
  { id: 'o1', full_name: 'Rakesh Patel', phone: '+919825012345', email: 'rakesh.patel@example.com', avatar_url: null, role: 'owner', area: 'Vesu', city: 'Surat', created_at: '2024-12-01T00:00:00Z' },
  { id: 'o3', full_name: 'Bhavesh Solanki', phone: '+919825045678', email: 'bhavesh.solanki@example.com', avatar_url: null, role: 'owner', area: 'Piplod', city: 'Surat', created_at: '2025-01-25T00:00:00Z' },
  { id: 'admin1', full_name: 'Urvil Kargathala', phone: '+919825000000', email: 'urvilk1542@gmail.com', avatar_url: null, role: 'admin', area: null, city: 'Surat', created_at: '2024-11-01T00:00:00Z' },
]
