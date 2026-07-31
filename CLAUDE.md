# CLAUDE.md — CricBooking Project

## Project

CricBooking is a cricket turf and ground booking platform for Surat, Gujarat, India. Three panels: User (players), Owner (turf owners), Admin (platform oversight). Built with Next.js 14.

## Tech Stack

- Next.js 14 (App Router, TypeScript, src/ directory)
- Tailwind CSS 3.4 (custom config — see design-system.md)
- Lucide React (icons only — no other icon library)
- Zustand (global state)
- clsx + tailwind-merge (className merging)
- date-fns (date formatting)
- Google Fonts: Space Grotesk (display/headings) + DM Sans (body)

## Rules

- NO component libraries (no Shadcn, Radix, Headless UI, MUI, Chakra). Build everything from scratch with Tailwind.
- NO backend calls until UI is fully complete. All data comes from src/lib/demo-data.ts.
- NO fetch(), no API routes, no server actions, no Supabase queries during UI phase.
- Every page must be 'use client' (we use hooks, state, event handlers).
- All interactivity must work: filtering, tab switching, slot selection, date changing, mobile menus, modals.
- No console.logs, no TODOs, no commented-out code in final output.

## Indian Context

- Currency: INR (₹) using formatPrice() from src/lib/utils.ts
- Phone: +91 format
- Areas: Surat localities (Vesu, Adajan, Varachha, etc.)
- Time: 12-hour AM/PM format
- All copy must be realistic for a cricket booking platform in Surat — no lorem ipsum.

## Design System

Refer to docs/design-system.md for all colors, typography, component patterns, and semantic tokens.

## File Naming

- Components: PascalCase (VenueCard.tsx)
- Pages: page.tsx inside route folders
- Utils/lib: camelCase (utils.ts, demo-data.ts)
- Types: index.ts in types/ folder

## Build Order

Follow the phase prompts in docs/phases/ directory. Build Phase 1 first, then Phase 2, and so on. Do not skip phases.

1. Phase 1: Project setup + foundation (types, utils, demo data, UI primitives)
2. Phase 2: Layout components (Header, Footer)
3. Phase 3: Homepage
4. Phase 4: Venue listing + venue detail page
5. Phase 5: Slot picker + booking flow
6. Phase 6: Auth (login) + My Bookings page
7. Phase 7: Owner dashboard (all 4 pages)
8. Phase 8: Admin panel (all 4 pages)

## Folder Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                    # Homepage
│   ├── login/page.tsx
│   ├── venues/page.tsx
│   ├── venues/[slug]/page.tsx
│   ├── bookings/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── venues/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── slots/page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── venues/page.tsx
│       ├── users/page.tsx
│       └── bookings/page.tsx
├── components/
│   ├── ui/          (Button, Input, Badge, Modal, Tabs)
│   ├── layout/      (Header, Footer)
│   ├── venue/       (VenueCard, AreaSelector, AmenityList)
│   └── booking/     (SlotPicker, DateSelector, BookingSummary, BookingCard)
├── lib/
│   ├── utils.ts
│   ├── supabase.ts  (placeholder)
│   └── demo-data.ts
├── store/
│   └── useStore.ts
└── types/
    └── index.ts
```

## After UI Phase

Once all 8 phases are complete and every page works with demo data, the next phase replaces demo data with Supabase, adds Razorpay payments, OTP auth, real-time slot updates, and WhatsApp notifications. That is a separate set of prompts.
