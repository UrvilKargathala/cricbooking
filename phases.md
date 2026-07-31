# CricBooking — UI Build Phases (All-in-One)

> Feed this file to Claude Code along with CLAUDE.md and design-system.md. Execute one phase at a time. Do not skip phases.

---

## PHASE 1: Project Setup + Foundation

### Goal
Set up the Next.js project and create all foundational files.

### 1.1 Initialize Project
```bash
npx create-next-app@14 cricbooking --typescript --tailwind --app --src-dir --no-import-alias
cd cricbooking
npm install clsx tailwind-merge lucide-react date-fns zustand @supabase/supabase-js @supabase/ssr
```

### 1.2 Configure Tailwind
Update `tailwind.config.ts` with brand and surface colors + font families from design-system.md.

### 1.3 Create globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
}

body {
  font-family: var(--font-body);
  background: #fafaf8;
  color: #292017;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d5d2cb; border-radius: 3px; }

.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
}
```

### 1.4 Root Layout (src/app/layout.tsx)
Metadata: title "CricBooking - Book Cricket Turfs & Grounds in Surat". Body class: `min-h-screen bg-surface-50`.

### 1.5 Types (src/types/index.ts)
```typescript
export type UserRole = 'user' | 'owner' | 'admin'
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type BookingSource = 'online' | 'walkin' | 'phone'
export type SlotStatus = 'available' | 'booked' | 'blocked'
export type VenueStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type SurfaceType = 'turf' | 'mat' | 'cement' | 'natural_grass' | 'synthetic'
export type SportType = 'box_cricket' | 'cricket' | 'football' | 'badminton' | 'tennis'

export interface Profile {
  id: string; full_name: string; phone: string | null; email: string | null
  avatar_url: string | null; role: UserRole; area: string | null; city: string; created_at: string
}
export interface Area { id: number; name: string; slug: string }
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
```

### 1.6 Utilities (src/lib/utils.ts)
- `cn()` — clsx + tailwind-merge
- `formatPrice(amount)` — INR with ₹, no decimals: `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)`
- `formatTime(time)` — "18:00" to "6:00 PM"
- `generateBookingCode()` — "CB-YYMMDD-XXXX" random
- `AMENITY_LABELS` — { parking: 'Parking', drinking_water: 'Drinking Water', restrooms: 'Restrooms', seating: 'Seating', lighting: 'Floodlights', changing_room: 'Changing Room', first_aid: 'First Aid', cafe: 'Cafeteria', equipment: 'Equipment Rental', wifi: 'WiFi' }
- `SPORT_LABELS` — { box_cricket: 'Box Cricket', cricket: 'Cricket', football: 'Football', badminton: 'Badminton', tennis: 'Tennis' }
- `SURFACE_LABELS` — { turf: 'Artificial Turf', mat: 'Mat', cement: 'Cement', natural_grass: 'Natural Grass', synthetic: 'Synthetic' }

### 1.7 Demo Data (src/lib/demo-data.ts)

**DEMO_AREAS** — 10 areas with id, name, slug:
Vesu, Adajan, Varachha, Katargam, Piplod, Dumas, Athwa, Pal, City Light, Ring Road

**DEMO_VENUES** — 6 venues fully populated:
1. Surat Cricket Arena — Vesu, 2 courts (Box-1 Turf ₹800/₹1000wknd/₹1200night, Box-2 Mat ₹600/₹800wknd/₹900night), box_cricket+cricket, 4.5 rating, 128 reviews, featured, amenities: parking,lighting,drinking_water,restrooms,seating,changing_room,first_aid
2. Champion Turf Ground — Adajan, 1 court (Turf A ₹600/₹800wknd), box_cricket, 4.2 rating, 67 reviews, amenities: parking,lighting,seating
3. Green Pitch Sports — Varachha, 2 courts (Box-1 ₹700/₹900wknd/₹1000night, Ground-1 ₹1000/₹1200wknd), box_cricket+football, 4.7 rating, 203 reviews, featured, amenities: parking,drinking_water,changing_room,cafe
4. Piplod Sports Hub — Piplod, 1 court (Ground-1 ₹1500/₹2000wknd, natural_grass, cricket, 22 players), cricket, 3.9 rating, 34 reviews, amenities: parking,lighting
5. Dumas Beach Cricket — Dumas, 1 court (Beach Ground ₹1200/₹1500wknd, natural_grass, 90min slots), cricket, 4.0 rating, 45 reviews, amenities: parking,restrooms,seating
6. Athwa Box Cricket Zone — Athwa, 1 court (Box-1 ₹900/₹1100wknd/₹1300night), box_cricket, 4.3 rating, 89 reviews, amenities: lighting,drinking_water,equipment

Each venue has: realistic Surat address, opening_time 06:00/07:00, closing_time 22:00/23:00, slot_duration_mins 60, min_advance_hours 1-3, max_advance_days 7-14, cancellation_hours 2-6, cancellation_refund_pct 50-100, area reference object.

**generateDemoSlots(courtId, date)** — returns Slot[] for 6AM-11PM (17 slots). Randomly mark 3-4 as "booked", 1 as "blocked". Night slots (18:00+) get higher price. Use deterministic random based on courtId+date so same inputs give same results.

**DEMO_USER_BOOKINGS** — 5 bookings: 3 upcoming (confirmed, different venues/dates), 2 past (1 completed, 1 cancelled). Include venue, court, slot references.

**DEMO_OWNER_BOOKINGS** — 8 bookings: 4 online, 2 walkin, 2 phone. 6 confirmed, 1 cancelled, 1 completed. Realistic Indian customer names.

**DEMO_ADMIN_VENUES** — 4 venues: 2 approved, 1 pending, 1 rejected. Include owner_name field.

**DEMO_ADMIN_USERS** — 10 users: 7 role=user, 2 role=owner, 1 role=admin. Realistic Indian names, +91 phones, varied join dates.

### 1.8 Zustand Store (src/store/useStore.ts)
```typescript
interface AppStore {
  user: Profile | null
  setUser: (user: Profile | null) => void
  selectedArea: string | null
  setSelectedArea: (slug: string | null) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
}
```
Default selectedDate to today's YYYY-MM-DD.

### 1.9 Supabase Placeholder (src/lib/supabase.ts)
Export placeholder createClient returning null with comment "Replace during backend phase".

### 1.10 UI Primitives (src/components/ui/)

**Button.tsx** — forwardRef. Props: variant (primary|secondary|outline|ghost default primary), size (sm|md|lg default md), className, children, all HTMLButton props. Use cn(). Include disabled:opacity-50, focus:ring-2 focus:ring-brand-400, transition-all duration-200.

**Input.tsx** — Props: label, icon (ReactNode), error (string), className, all HTMLInput props. Label above in text-sm font-medium text-surface-800 mb-1.5. Icon positioned absolute left-3 center. Error below in text-xs text-red-600 mt-1.

**Badge.tsx** — Props: variant (confirmed|cancelled|completed|no_show|pending|approved|rejected|suspended|online|walkin|phone), children. Renders: inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full. Dot: w-1.5 h-1.5 rounded-full. Colors from design-system.md semantic tokens.

**Modal.tsx** — Props: isOpen, onClose, title, children. Overlay: fixed inset-0 z-50 bg-black/50. Card: centered, bg-white rounded-xl max-w-md w-full mx-4 p-6. Header: flex justify-between, title in font-display font-semibold, X button. Close on Escape key and overlay click.

**Tabs.tsx** — Props: tabs ({key:string, label:string}[]), activeTab (string), onChange (key => void). Horizontal row with border-b border-surface-200. Each tab: px-4 py-2.5 text-sm font-medium. Active: border-b-2 border-brand-600 text-brand-600. Inactive: text-surface-800/60 hover:text-surface-800.

### Phase 1 Verify
Run `npm run dev`. Blank page with #fafaf8 background. All imports resolve. No errors.

---

## PHASE 2: Layout Components

### Goal
Build Header and Footer that wrap every user-facing page.

### Header (src/components/layout/Header.tsx)

`'use client'` — uses useState for mobile menu.

Sticky: `sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-200`. Height: h-16.

**Desktop (hidden md:flex)**:
- Left: Logo link to "/". Orange square (w-9 h-9 bg-brand-600 rounded-lg) with white "C" (font-display font-bold text-lg). Text: `font-display font-bold text-xl` "Cric" surface-900 + "Booking" brand-600.
- Center: Search input (flex-1 max-w-xl mx-8). Relative div. Search icon absolute left-3 center w-4 h-4 text-surface-800/40. Input: pl-10 pr-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-400.
- Right: flex items-center gap-3. Location button: MapPin icon brand-500 + "Surat". Divider: w-px h-6 bg-surface-200. "My Bookings" ghost button linking /bookings. "Login" primary button sm with User icon linking /login.

**Mobile (md:hidden)**:
- Logo left, hamburger button right (Menu/X toggle).
- Expandable panel below header: max-h transition, border-t, bg-white. Contains: search input, "My Bookings" link, "Login / Sign Up" full-width primary button.

### Footer (src/components/layout/Footer.tsx)

`bg-surface-900 text-surface-200 mt-20`. Container py-12.

4-column grid (grid-cols-2 md:grid-cols-4 gap-8):
- Column 1 (col-span-2 md:col-span-1): Logo (w-8 h-8 bg-brand-500 rounded-lg) + "CricBooking" font-display bold white. Description paragraph text-sm text-surface-200/60.
- Column 2 "Popular Areas": Vesu, Adajan, Varachha, Piplod, Katargam links. Style: text-sm text-surface-200/60 hover:text-white.
- Column 3 "Quick Links": All Venues, My Bookings, About Us, Contact.
- Column 4 "For Venue Owners": List Your Venue, Owner Dashboard, Pricing.

Bottom: mt-10 pt-6 border-t border-white/10, copyright centered text-xs text-surface-200/40.

### Phase 2 Verify
Temporary page.tsx renders Header + content + Footer. Header is sticky, mobile menu toggles, footer renders at all breakpoints.

---

## PHASE 3: Homepage

### Goal
Build the landing page — hero, how-it-works, venue grid, owner CTA.

### Build VenueCard first (src/components/venue/VenueCard.tsx)
Link wrapping to `/venues/${venue.slug}`. Card with image area (aspect-[16/10]) — gradient placeholder if no cover_image, featured badge top-left (amber-500), price badge bottom-right (white/90 backdrop-blur). Content: name (font-display semibold, group-hover:text-brand-700), area with MapPin, sport tags (max 3, brand-50 bg brand-700 text), bottom row with star rating + opening hours separated by border-t.

### Build AreaSelector (src/components/venue/AreaSelector.tsx)
Horizontal scroll, pills for "All Areas" + each area. Selected: bg-brand-600 text-white. Unselected: bg-white border-surface-200.

### Homepage (src/app/page.tsx)

**Hero**: gradient bg (from-surface-900 via-brand-900 to-surface-900), dot pattern overlay 10% opacity, h1 "Book Cricket Turfs" + "Across Surat" in brand-400, subtitle, search bar (white input + brand button), stats row. Padding py-16 sm:py-24.

**How it works**: 3 cards row. MapPin "Pick Your Area", Calendar "Choose a Slot", Shield "Book Instantly". White cards, brand-50 icon containers.

**Venues**: "Venues Near You" heading + "View All" link. AreaSelector. 3-col VenueCard grid. useState for selectedArea, filter DEMO_VENUES. Empty state with MapPin icon.

**Owner CTA**: bg-brand-600 full-width. "Own a Turf or Cricket Ground?" + secondary button "List Your Venue".

Wrap with Header + Footer.

### Phase 3 Verify
Homepage renders all sections. Area filtering works client-side. 6 venue cards show. Mobile responsive at 375px.

---

## PHASE 4: Venue Listing + Detail

### Goal
Browse venues with filters, and full venue detail page.

### Venue Listing (src/app/venues/page.tsx)
Header + Footer. Heading "All Venues in Surat" + count. Filter bar: AreaSelector + sport select dropdown + price sort dropdown. VenueCard grid. Client-side combined filtering. Empty state with "Clear Filters" button.

### Venue Detail (src/app/venues/[slug]/page.tsx)
Header + Footer. Back link with ChevronLeft. Two-column grid (1:2 on lg).

**Left column**: Cover placeholder (aspect-4/3, gradient, venue initial). Info card (name h1, rating, address, hours, phone, description). Sports card. Amenities card (2-col grid, brand-400 dots). Courts & Pricing card (each court in surface-50 row). Policies card.

**Right column**: White card "Book a Slot" heading. Placeholder text "SlotPicker component added in Phase 5".

Hardcode Surat Cricket Arena data with 2 courts for now.

### Phase 4 Verify
/venues shows filtered grid. /venues/surat-cricket-arena shows full detail. Mobile responsive.

---

## PHASE 5: Slot Picker + Booking Flow

### Goal
Build the core booking interaction.

### DateSelector (src/components/booking/DateSelector.tsx)
Props: selectedDate, onDateChange. Generate 14 days from today. Horizontal scroll, each day shows weekday/day/month. Selected: brand-600 white. Today pre-selected.

### BookingSummary (src/components/booking/BookingSummary.tsx)
Props: selectedCount, totalAmount, onBook. Only renders when selectedCount > 0. Sticky bottom-4, white card with shadow-xl. Left: count + total (font-display bold text-xl). Right: "Book Now" primary lg button.

### SlotPicker (src/components/booking/SlotPicker.tsx)
Props: courts, slots, selectedDate, onDateChange, onBook.
State: activeCourt, selectedSlots[].

Court tabs (if 2+ courts): brand-600 active, surface-100 inactive. Switching resets selectedSlots.
DateSelector: switching resets selectedSlots.
Slot grid (.slot-grid class): filter by activeCourt. Each slot button shows formatTime + formatPrice. States: available (white, hover:brand-50), selected (brand-600 white ring-2), booked/blocked (surface-100 line-through disabled).
Legend row. BookingSummary with calculated total.

### Integration
Replace venue detail page placeholder with actual SlotPicker. Wire up: courts from venue data, slots from generateDemoSlots(), onBook shows alert with total.

### Phase 5 Verify
Slot picker works on venue detail page. Court tabs switch. Date selector scrolls. Slots toggle. Booked slots disabled. Summary bar appears/disappears. Book Now alerts. Mobile works.

---

## PHASE 6: Auth + My Bookings

### Goal
Login page UI and booking history page.

### Login (src/app/login/page.tsx)
Header + Footer. Centered card max-w-md py-16.

Step 1: Logo, "Welcome to CricBooking" heading, "+91" addon + phone input, "Send OTP" button. Mock: setTimeout 1.5s to step 2, loading state on button.

Step 2: "Enter OTP sent to +91 XXXXXXXXXX" label. 4 separate w-12 h-12 digit inputs with auto-focus-next and backspace-to-previous. "Verify" button. "Resend OTP" with 30s countdown timer. Mock: setTimeout 1.5s, redirect to "/".

### BookingCard (src/components/booking/BookingCard.tsx)
Props: booking, showCancel. White card. Top: booking code (mono xs) + status Badge. Venue name (font-display semibold) + court. Date+time with Calendar+Clock icons. Bottom row with border-t: amount (font-display semibold brand-700) + source Badge + cancel button (if showCancel, red outline sm).

### My Bookings (src/app/bookings/page.tsx)
Header + Footer. Container max-w-3xl py-8. "My Bookings" heading. Tabs: Upcoming | Past. Filter DEMO_USER_BOOKINGS by tab. BookingCard list with showCancel for upcoming+confirmed. Empty state: Calendar icon + "No bookings yet" + link to /venues.

### Phase 6 Verify
/login OTP flow works (phone → OTP → redirect). Auto-focus and countdown work. /bookings tabs switch, cards render, cancel visible on upcoming only. Mobile responsive.

---

## PHASE 7: Owner Dashboard

### Goal
Complete owner management interface — sidebar layout + 4 pages.

### Dashboard Layout (src/app/dashboard/layout.tsx)
Fixed sidebar w-64 bg-surface-900. Logo: w-8 h-8 bg-brand-500 "C" + "Owner Panel". Nav: Overview (LayoutDashboard), My Venues (MapPin), Bookings (Calendar), Slot Management (Clock). Active: bg-brand-600 text-white. Inactive: text-white/60 hover:bg-white/10. Bottom: avatar circle bg-brand-700 "VO" + name + email. Mobile: slide-in with overlay, hamburger toggle. Top bar: sticky, "Dashboard" heading.

### Overview (src/app/dashboard/page.tsx)
4 stat cards (Today's Bookings 8 blue, Today's Revenue ₹6,400 green, This Month ₹1,48,500 orange, Customers 342 purple). Recent bookings table (first 5 DEMO_OWNER_BOOKINGS): Code, Customer, Court, Time, Amount, Source badge, Status badge. 2 quick action cards: "Create Walk-in Booking" + "Block Time Slots".

### My Venues (src/app/dashboard/venues/page.tsx)
"My Venues" heading + "Add New Venue" button. List first 2 DEMO_VENUES as owner's. Each: thumbnail placeholder + name + address + courts + status Badge + "Edit" ghost button. "Add New Venue" shows alert.

### Bookings (src/app/dashboard/bookings/page.tsx)
"Bookings" heading + "Create Walk-in" button. Filter row: date input, court select, status select, source select. Full table of 8 DEMO_OWNER_BOOKINGS. "Create Walk-in" shows alert.

### Slot Management (src/app/dashboard/slots/page.tsx)
Court tabs (reuse pattern). DateSelector (reuse). Slot grid for selected court+date. Click available → alert "Block this slot?". Click blocked → alert "Unblock?". Click booked → alert showing booking details.

### Phase 7 Verify
/dashboard shows stats + table + actions. /dashboard/venues shows venue list. /dashboard/bookings shows filtered table. /dashboard/slots shows interactive grid. Sidebar nav highlights active page. Mobile sidebar slides.

---

## PHASE 8: Admin Panel

### Goal
Platform-wide oversight — sidebar layout + 4 pages.

### Admin Layout (src/app/admin/layout.tsx)
Same pattern as owner but: bg-surface-800, logo uses bg-red-500 with Shield icon, text "Super Admin". Active nav: bg-red-600/20 text-red-300. Top bar: "Admin Panel".

### Overview (src/app/admin/page.tsx)
4 stats: Total Venues "52" (subtext "3 pending" amber), Total Users "1,247", Total Bookings "8,432", Revenue ₹67,50,000.
Pending Approvals section: filter DEMO_ADMIN_VENUES for pending. Each: venue name + owner + area, "Approve" (emerald) + "Reject" (red) buttons. Mock alerts.
Recent Activity: 5-item timeline with colored dots. Amber: submissions. Brand: bookings. Blue: registrations. Emerald: approvals. Red: cancellations.

### All Venues (src/app/admin/venues/page.tsx)
Filter tabs: All | Pending | Approved | Rejected | Suspended (with counts).
Table: Name, Owner, Area, Courts, Bookings count, Revenue, Status badge, Featured toggle, Actions (Approve/Reject/Suspend contextual). Use DEMO_ADMIN_VENUES filtered by tab. Toggles and buttons show alerts.

### Users & Owners (src/app/admin/users/page.tsx)
Search input. Role tabs: All | Users | Owners | Admins. Table: avatar+Name, Email, Phone, Role badge (user=blue, owner=brand, admin=red), Bookings count, Joined date. Role change select dropdown per row, shows alert. Filter by search text (name/email) + role tab. Use DEMO_ADMIN_USERS.

### All Bookings (src/app/admin/bookings/page.tsx)
Filter bar: date-from, date-to, venue select, status select, source select, "Export" outline button (alert). Table: Code (mono), Venue, Court, Customer, Date, Time, Amount, Source badge, Status badge. Combined DEMO_OWNER_BOOKINGS + DEMO_USER_BOOKINGS.

### Phase 8 Verify
/admin shows stats + pending approvals + activity. /admin/venues table with tabs and actions. /admin/users searchable + role filter. /admin/bookings filtered table. Admin sidebar red accent distinct from owner. All mobile responsive.

---

## POST-BUILD CHECKLIST

After all 8 phases are complete, verify:
- [ ] Every page renders without console errors
- [ ] All navigation links work (Header, Footer, sidebar, in-page links)
- [ ] Area filtering works on homepage and venue listing
- [ ] Sport filter and price sort work on venue listing
- [ ] Slot picker: court tabs, date selector, slot selection, summary bar all functional
- [ ] Login OTP flow: phone → OTP → redirect works with mock
- [ ] My Bookings: tabs switch, cards render correctly
- [ ] Owner dashboard: all 4 pages render, sidebar navigation works
- [ ] Admin panel: all 4 pages render, sidebar navigation works, distinct from owner
- [ ] Mobile responsive at 375px on every single page
- [ ] No hardcoded green colors anywhere — all brand colors are orange
- [ ] All prices show in ₹ INR format
- [ ] All times show in 12h AM/PM format
