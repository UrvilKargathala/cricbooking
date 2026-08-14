import type { Area, Venue, Court, Slot, Booking, VenueStatus, SportType, UserRole } from '@/types'

export const DEMO_AREAS: Area[] = [
  { id: 1, name: 'Vesu', slug: 'vesu', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600' },
  { id: 2, name: 'Adajan', slug: 'adajan', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg/960px-Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg' },
  { id: 3, name: 'Varachha', slug: 'varachha', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Cockfosters_CC_v_Radlett_CC_at_Cockfosters%2C_London%2C_England_10.jpg/960px-Cockfosters_CC_v_Radlett_CC_at_Cockfosters%2C_London%2C_England_10.jpg' },
  { id: 4, name: 'Katargam', slug: 'katargam', image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=600' },
  { id: 5, name: 'Piplod', slug: 'piplod', image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=600' },
  { id: 6, name: 'Dumas', slug: 'dumas', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600' },
  { id: 7, name: 'Athwa', slug: 'athwa', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg/960px-Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg' },
  { id: 8, name: 'Pal', slug: 'pal', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Cockfosters_CC_v_Radlett_CC_at_Cockfosters%2C_London%2C_England_10.jpg/960px-Cockfosters_CC_v_Radlett_CC_at_Cockfosters%2C_London%2C_England_10.jpg' },
  { id: 9, name: 'City Light', slug: 'city-light', image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=600' },
  { id: 10, name: 'Ring Road', slug: 'ring-road', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600' },
]

const areaBySlug = (slug: string) => DEMO_AREAS.find((a) => a.slug === slug)!

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=900',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg/960px-Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Cockfosters_CC_v_Radlett_CC_at_Cockfosters%2C_London%2C_England_10.jpg/960px-Cockfosters_CC_v_Radlett_CC_at_Cockfosters%2C_London%2C_England_10.jpg',
  'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=900',
]

function galleryFor(coverIndex: number) {
  return [0, 1, 2, 3].map((i) => PHOTO_POOL[(coverIndex + i) % PHOTO_POOL.length])
}

const courtsByVenue: Record<string, Court[]> = {
  'v1': [
    { id: 'c1', venue_id: 'v1', name: 'Box-1 Turf', surface: 'turf', sport: 'turf', max_players: 12, dimensions: '110x60 ft', price_per_slot: 800, weekend_price: 1000, night_price: 1200, is_active: true },
    { id: 'c2', venue_id: 'v1', name: 'Box-2 Mat', surface: 'mat', sport: 'cricket_ground', max_players: 12, dimensions: '100x50 ft', price_per_slot: 600, weekend_price: 800, night_price: 900, is_active: true },
  ],
  'v2': [
    { id: 'c3', venue_id: 'v2', name: 'Turf A', surface: 'turf', sport: 'turf', max_players: 12, dimensions: '100x50 ft', price_per_slot: 600, weekend_price: 800, night_price: null, is_active: true },
  ],
  'v3': [
    { id: 'c4', venue_id: 'v3', name: 'Box-1', surface: 'turf', sport: 'turf', max_players: 12, dimensions: '110x60 ft', price_per_slot: 700, weekend_price: 900, night_price: 1000, is_active: true },
    { id: 'c5', venue_id: 'v3', name: 'Ground-1', surface: 'turf', sport: 'cricket_ground', max_players: 14, dimensions: '130x70 ft', price_per_slot: 1000, weekend_price: 1200, night_price: null, is_active: true },
  ],
  'v4': [
    { id: 'c6', venue_id: 'v4', name: 'Ground-1', surface: 'natural_grass', sport: 'cricket_ground', max_players: 22, dimensions: '180x150 ft', price_per_slot: 1500, weekend_price: 2000, night_price: null, is_active: true },
  ],
  'v5': [
    { id: 'c7', venue_id: 'v5', name: 'Beach Ground', surface: 'natural_grass', sport: 'cricket_ground', max_players: 16, dimensions: '120x80 ft', price_per_slot: 1200, weekend_price: 1500, night_price: null, is_active: true },
  ],
  'v6': [
    { id: 'c8', venue_id: 'v6', name: 'Box-1', surface: 'turf', sport: 'turf', max_players: 12, dimensions: '100x50 ft', price_per_slot: 900, weekend_price: 1100, night_price: 1300, is_active: true },
  ],
}

export const DEMO_VENUES: Venue[] = [
  {
    id: 'v1', owner_id: 'o1', name: 'Surat Cricket Arena', slug: 'surat-cricket-arena',
    description: 'Premium box cricket arena with dual turf and mat courts, floodlit for night matches.',
    address: 'Near VR Mall, Dumas Road, Vesu, Surat', area_id: 1, city: 'Surat', phone: '+919825012345',
    cover_image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    images: galleryFor(0), amenities: ['parking', 'lighting', 'drinking_water', 'restrooms', 'seating', 'changing_room', 'first_aid'],
    sports: ['turf', 'cricket_ground'], opening_time: '06:00', closing_time: '23:00', slot_duration_mins: 60,
    min_advance_hours: 2, max_advance_days: 14, cancellation_hours: 4, cancellation_refund_pct: 80,
    rating: 4.5, total_reviews: 128, status: 'approved', is_featured: true, created_at: '2025-01-10T00:00:00Z',
    area: areaBySlug('vesu'), courts: courtsByVenue['v1'],
  },
  {
    id: 'v2', owner_id: 'o2', name: 'Champion Turf Ground', slug: 'champion-turf-ground',
    description: 'Compact single-court turf ground, popular for evening corporate matches.',
    address: 'Opp. Iskcon Temple, Adajan Road, Adajan, Surat', area_id: 2, city: 'Surat', phone: '+919825023456',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg/960px-Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg',
    images: galleryFor(1), amenities: ['parking', 'lighting', 'seating'],
    sports: ['turf'], opening_time: '07:00', closing_time: '22:00', slot_duration_mins: 60,
    min_advance_hours: 1, max_advance_days: 7, cancellation_hours: 2, cancellation_refund_pct: 50,
    rating: 4.2, total_reviews: 67, status: 'approved', is_featured: false, created_at: '2025-02-14T00:00:00Z',
    area: areaBySlug('adajan'), courts: courtsByVenue['v2'],
  },
  {
    id: 'v3', owner_id: 'o1', name: 'Green Pitch Sports', slug: 'green-pitch-sports',
    description: 'Facility with a box cricket turf and a full-size cricket ground on the same premises.',
    address: 'Near Kapodra Circle, Varachha Road, Varachha, Surat', area_id: 3, city: 'Surat', phone: '+919825034567',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Cockfosters_CC_v_Radlett_CC_at_Cockfosters%2C_London%2C_England_10.jpg/960px-Cockfosters_CC_v_Radlett_CC_at_Cockfosters%2C_London%2C_England_10.jpg',
    images: galleryFor(2), amenities: ['parking', 'drinking_water', 'changing_room', 'cafe'],
    sports: ['turf', 'cricket_ground'], opening_time: '06:00', closing_time: '23:00', slot_duration_mins: 60,
    min_advance_hours: 2, max_advance_days: 14, cancellation_hours: 6, cancellation_refund_pct: 100,
    rating: 4.7, total_reviews: 203, status: 'approved', is_featured: true, created_at: '2024-11-05T00:00:00Z',
    area: areaBySlug('varachha'), courts: courtsByVenue['v3'],
  },
  {
    id: 'v4', owner_id: 'o3', name: 'Piplod Sports Hub', slug: 'piplod-sports-hub',
    description: 'Full-size natural grass cricket ground for serious league matches.',
    address: 'Behind Piplod Garden, Piplod, Surat', area_id: 5, city: 'Surat', phone: '+919825045678',
    cover_image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=800',
    images: galleryFor(3), amenities: ['parking', 'lighting'],
    sports: ['cricket_ground'], opening_time: '06:00', closing_time: '22:00', slot_duration_mins: 60,
    min_advance_hours: 3, max_advance_days: 10, cancellation_hours: 6, cancellation_refund_pct: 50,
    rating: 3.9, total_reviews: 34, status: 'approved', is_featured: false, created_at: '2025-03-20T00:00:00Z',
    area: areaBySlug('piplod'), courts: courtsByVenue['v4'],
  },
  {
    id: 'v5', owner_id: 'o3', name: 'Dumas Beach Cricket', slug: 'dumas-beach-cricket',
    description: 'Scenic beachside cricket ground near Dumas, great for weekend games.',
    address: 'Dumas Beach Road, Dumas, Surat', area_id: 6, city: 'Surat', phone: '+919825056789',
    cover_image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    images: galleryFor(0), amenities: ['parking', 'restrooms', 'seating'],
    sports: ['cricket_ground'], opening_time: '06:00', closing_time: '21:00', slot_duration_mins: 90,
    min_advance_hours: 2, max_advance_days: 7, cancellation_hours: 4, cancellation_refund_pct: 50,
    rating: 4.0, total_reviews: 45, status: 'approved', is_featured: false, created_at: '2025-04-01T00:00:00Z',
    area: areaBySlug('dumas'), courts: courtsByVenue['v5'],
  },
  {
    id: 'v6', owner_id: 'o4', name: 'Athwa Box Cricket Zone', slug: 'athwa-box-cricket-zone',
    description: 'Neighborhood box cricket favorite with equipment rental on site.',
    address: 'Near Athwa Gate, Athwalines, Surat', area_id: 7, city: 'Surat', phone: '+919825067890',
    cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg/960px-Cambridge_University_CC_v_MCC_at_Cambridge%2C_England_023.jpg',
    images: galleryFor(1), amenities: ['lighting', 'drinking_water', 'equipment'],
    sports: ['turf'], opening_time: '06:00', closing_time: '23:00', slot_duration_mins: 60,
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

export interface VenueReview {
  id: string
  venue_id: string
  name: string
  rating: number
  comment: string
  created_at: string
}

export const DEMO_VENUE_REVIEWS: VenueReview[] = [
  { id: 'r1', venue_id: 'v1', name: 'Rohan Patel', rating: 5, comment: 'Best turf in Vesu. Lights are bright even for 9pm matches and the mat court drains well after rain.', created_at: '2026-07-18T00:00:00Z' },
  { id: 'r2', venue_id: 'v1', name: 'Aarav Bhatt', rating: 4, comment: 'Good facility, gets crowded on weekends so book early. Parking could be bigger.', created_at: '2026-07-02T00:00:00Z' },
  { id: 'r3', venue_id: 'v1', name: 'Isha Mehta', rating: 5, comment: 'Clean changing rooms and the staff is helpful. Our office plays here every Friday now.', created_at: '2026-06-20T00:00:00Z' },
  { id: 'r4', venue_id: 'v2', name: 'Kunal Shah', rating: 4, comment: 'Solid turf for the price. No frills but does the job for a casual game.', created_at: '2026-07-10T00:00:00Z' },
  { id: 'r5', venue_id: 'v2', name: 'Priya Trivedi', rating: 4, comment: 'Easy booking, turf quality is decent. Wish they had drinking water on site.', created_at: '2026-06-28T00:00:00Z' },
  { id: 'r6', venue_id: 'v3', name: 'Devansh Gandhi', rating: 5, comment: 'Two courts in one place is a huge plus — we switch between the turf and the full ground back to back.', created_at: '2026-07-15T00:00:00Z' },
  { id: 'r7', venue_id: 'v3', name: 'Meera Shukla', rating: 5, comment: 'The cafe after the match is a nice touch. Best maintained ground in Varachha.', created_at: '2026-07-01T00:00:00Z' },
  { id: 'r8', venue_id: 'v3', name: 'Nirav Joshi', rating: 4, comment: 'Great ground, only downside is it books out fast on weekends.', created_at: '2026-06-14T00:00:00Z' },
  { id: 'r9', venue_id: 'v4', name: 'Sameer Pathan', rating: 4, comment: 'Real grass, feels like proper cricket. A bit far but worth it for league matches.', created_at: '2026-06-30T00:00:00Z' },
  { id: 'r10', venue_id: 'v5', name: 'Yash Rana', rating: 4, comment: 'Beautiful location right by the beach. Wind can affect the ball so plan accordingly.', created_at: '2026-07-05T00:00:00Z' },
  { id: 'r11', venue_id: 'v6', name: 'Manav Desai', rating: 5, comment: 'Equipment rental saved us — forgot our bats and they had spares ready.', created_at: '2026-07-20T00:00:00Z' },
  { id: 'r12', venue_id: 'v6', name: 'Jignesh Modi', rating: 4, comment: 'Good neighborhood turf, floodlights are strong for night games.', created_at: '2026-06-25T00:00:00Z' },
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
  { id: 'ob4', booking_code: 'CB-260727-A4B4', user_id: null, venue_id: 'v1', court_id: 'c2', slot_id: 'os4', booked_by: 'owner', source: 'phone', customer_name: 'Jignesh Modi', customer_phone: '+919825444444', amount: 600, payment_status: 'pending', status: 'confirmed', notes: 'Will pay at venue', created_at: '2026-07-25T15:00:00Z', venue: venueById('v1'), court: courtById('c2'), slot: demoSlot('os4', 'c2', '2026-07-27', '07:00', '08:00', 600) },
  { id: 'ob5', booking_code: 'CB-260728-A5B5', user_id: 'u4', venue_id: 'v1', court_id: 'c1', slot_id: 'os5', booked_by: 'u4', source: 'online', customer_name: 'Aarav Bhatt', customer_phone: '+919825555555', amount: 1200, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-24T18:00:00Z', venue: venueById('v1'), court: courtById('c1'), slot: demoSlot('os5', 'c1', '2026-07-28', '21:00', '22:00', 1200) },
  { id: 'ob6', booking_code: 'CB-260722-A6B6', user_id: null, venue_id: 'v1', court_id: 'c2', slot_id: 'os6', booked_by: 'owner', source: 'walkin', customer_name: 'Sameer Pathan', customer_phone: '+919825666666', amount: 600, payment_status: 'paid', status: 'cancelled', notes: 'Customer no-show request', created_at: '2026-07-20T09:00:00Z', venue: venueById('v1'), court: courtById('c2'), slot: demoSlot('os6', 'c2', '2026-07-22', '06:00', '07:00', 600) },
  { id: 'ob7', booking_code: 'CB-260718-A7B7', user_id: 'u5', venue_id: 'v1', court_id: 'c1', slot_id: 'os7', booked_by: 'u5', source: 'online', customer_name: 'Nirav Joshi', customer_phone: '+919825777777', amount: 800, payment_status: 'paid', status: 'completed', notes: null, created_at: '2026-07-15T13:00:00Z', venue: venueById('v1'), court: courtById('c1'), slot: demoSlot('os7', 'c1', '2026-07-18', '17:00', '18:00', 800) },
  { id: 'ob8', booking_code: 'CB-260729-A8B8', user_id: null, venue_id: 'v1', court_id: 'c2', slot_id: 'os8', booked_by: 'owner', source: 'phone', customer_name: 'Yash Rana', customer_phone: '+919825888888', amount: 900, payment_status: 'paid', status: 'confirmed', notes: null, created_at: '2026-07-26T08:00:00Z', venue: venueById('v1'), court: courtById('c2'), slot: demoSlot('os8', 'c2', '2026-07-29', '19:00', '20:00', 900) },
]

export const DEMO_ADMIN_VENUES = [
  {
    id: 'av1', name: 'Surat Cricket Arena', slug: 'surat-cricket-arena',
    owner_name: 'Rakesh Sharma', owner_phone: '+91 98765 43210',
    area: 'Vesu', courts_count: 2, bookings_count: 128, revenue: 245000,
    status: 'approved' as VenueStatus, is_featured: true,
    sports: ['turf', 'cricket_ground'] as SportType[],
    created_at: '2026-01-15',
  },
  {
    id: 'av2', name: 'Green Pitch Sports', slug: 'green-pitch-sports',
    owner_name: 'Mehul Patel', owner_phone: '+91 87654 32109',
    area: 'Varachha', courts_count: 2, bookings_count: 203, revenue: 389000,
    status: 'approved' as VenueStatus, is_featured: true,
    sports: ['turf', 'cricket_ground'] as SportType[],
    created_at: '2026-02-20',
  },
  {
    id: 'av3', name: 'Royal Cricket Box', slug: 'royal-cricket-box',
    owner_name: 'Jayesh Modi', owner_phone: '+91 76543 21098',
    area: 'Katargam', courts_count: 1, bookings_count: 0, revenue: 0,
    status: 'pending' as VenueStatus, is_featured: false,
    sports: ['turf'] as SportType[],
    created_at: '2026-08-07',
  },
  {
    id: 'av4', name: 'Sunset Turf Zone', slug: 'sunset-turf-zone',
    owner_name: 'Vishal Desai', owner_phone: '+91 65432 10987',
    area: 'Pal', courts_count: 1, bookings_count: 0, revenue: 0,
    status: 'pending' as VenueStatus, is_featured: false,
    sports: ['turf', 'cricket_ground'] as SportType[],
    created_at: '2026-08-08',
  },
  {
    id: 'av5', name: 'Old City Cricket Ground', slug: 'old-city-cricket',
    owner_name: 'Firoz Khan', owner_phone: '+91 54321 09876',
    area: 'Ring Road', courts_count: 1, bookings_count: 0, revenue: 0,
    status: 'rejected' as VenueStatus, is_featured: false,
    sports: ['cricket_ground'] as SportType[],
    created_at: '2026-07-25',
  },
  {
    id: 'av6', name: 'City Light Sports Complex', slug: 'city-light-sports',
    owner_name: 'Bhavesh Jain', owner_phone: '+91 43210 98765',
    area: 'City Light', courts_count: 3, bookings_count: 89, revenue: 156000,
    status: 'approved' as VenueStatus, is_featured: false,
    sports: ['turf', 'cricket_ground'] as SportType[],
    created_at: '2026-03-10',
  },
]

export const DEMO_ADMIN_USERS = [
  { id: 'au1', full_name: 'Urvil Kargathala', email: 'urvil@cricbooking.com', phone: '+91 99887 76655', role: 'admin' as UserRole, bookings_count: 0, created_at: '2026-01-01' },
  { id: 'au2', full_name: 'Rakesh Sharma', email: 'rakesh@gmail.com', phone: '+91 98765 43210', role: 'owner' as UserRole, bookings_count: 0, created_at: '2026-01-15' },
  { id: 'au3', full_name: 'Mehul Patel', email: 'mehul@gmail.com', phone: '+91 87654 32109', role: 'owner' as UserRole, bookings_count: 0, created_at: '2026-02-20' },
  { id: 'au4', full_name: 'Raj Patel', email: 'raj@gmail.com', phone: '+91 98765 43210', role: 'user' as UserRole, bookings_count: 12, created_at: '2026-03-05' },
  { id: 'au5', full_name: 'Amit Shah', email: 'amit@gmail.com', phone: '+91 76543 21098', role: 'user' as UserRole, bookings_count: 8, created_at: '2026-03-12' },
  { id: 'au6', full_name: 'Priya Joshi', email: 'priya@gmail.com', phone: '+91 54321 09876', role: 'user' as UserRole, bookings_count: 5, created_at: '2026-04-01' },
  { id: 'au7', full_name: 'Karan Mehta', email: 'karan@gmail.com', phone: '+91 65432 10987', role: 'user' as UserRole, bookings_count: 15, created_at: '2026-04-18' },
  { id: 'au8', full_name: 'Darshan Desai', email: 'darshan@gmail.com', phone: '+91 43210 98765', role: 'user' as UserRole, bookings_count: 3, created_at: '2026-05-02' },
  { id: 'au9', full_name: 'Neha Gupta', email: 'neha@gmail.com', phone: '+91 32109 87654', role: 'user' as UserRole, bookings_count: 7, created_at: '2026-06-14' },
  { id: 'au10', full_name: 'Vijay Kumar', email: 'vijay@gmail.com', phone: '+91 21098 76543', role: 'user' as UserRole, bookings_count: 2, created_at: '2026-07-01' },
  { id: 'au11', full_name: 'Bhavesh Jain', email: 'bhavesh@gmail.com', phone: '+91 43210 98765', role: 'owner' as UserRole, bookings_count: 0, created_at: '2026-03-10' },
  { id: 'au12', full_name: 'Anita Rao', email: 'anita@gmail.com', phone: '+91 55667 78899', role: 'user' as UserRole, bookings_count: 9, created_at: '2026-07-20' },
]

export const DEMO_ADMIN_ACTIVITY = [
  { id: 'act1', type: 'venue_submitted', message: 'New venue submitted: Royal Cricket Box', time: '2 hours ago', color: '#f59e0b' },
  { id: 'act2', type: 'booking', message: 'Booking #CB-260809-A1X2 confirmed at Surat Cricket Arena', time: '3 hours ago', color: '#ea580c' },
  { id: 'act3', type: 'user_registered', message: 'New user registered: Anita Rao', time: '5 hours ago', color: '#3b82f6' },
  { id: 'act4', type: 'venue_approved', message: 'Venue approved: City Light Sports Complex', time: '1 day ago', color: '#10b981' },
  { id: 'act5', type: 'booking_cancelled', message: 'Booking #CB-260808-E5V1 cancelled by Priya Joshi', time: '1 day ago', color: '#ef4444' },
  { id: 'act6', type: 'venue_submitted', message: 'New venue submitted: Sunset Turf Zone', time: '2 days ago', color: '#f59e0b' },
  { id: 'act7', type: 'booking', message: 'Walk-in booking created at Green Pitch Sports', time: '2 days ago', color: '#ea580c' },
  { id: 'act8', type: 'venue_rejected', message: 'Venue rejected: Old City Cricket Ground (incomplete photos)', time: '3 days ago', color: '#ef4444' },
]
