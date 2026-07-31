# CricBooking — Design System

## Brand Identity

- **Primary color**: Orange (#ea580c)
- **Feel**: Cricket energy, warm, sporty, trustworthy
- **Logo**: Orange rounded square with white "C" + "Cric" in surface-900 + "Booking" in brand-600

---

## Colors

### Brand Orange (primary ramp)

| Token | Hex | Usage |
|-------|-----|-------|
| brand-50 | #fff7ed | Tag backgrounds, icon containers, light hover fills |
| brand-100 | #ffedd5 | Light fill, selected row bg |
| brand-200 | #fed7aa | Light accent borders |
| brand-300 | #fdba74 | — |
| brand-400 | #fb923c | Hero accent text ("Across Surat"), MapPin icon color |
| brand-500 | #f97316 | Hover states on secondary elements |
| brand-600 | #ea580c | **PRIMARY** — buttons, active tabs, selected slots, links, logo |
| brand-700 | #c2410c | Button hover, tag text on brand-50 bg |
| brand-800 | #9a3412 | Dark text on brand-50 bg |
| brand-900 | #7c2d12 | Hero gradient mix |

### Surface (warm grays)

| Token | Hex | Usage |
|-------|-----|-------|
| surface-0 | #ffffff | Cards, modals, header bg, dropdowns |
| surface-50 | #fafaf8 | **Page background** (body bg) |
| surface-100 | #f4f3f0 | Input backgrounds, inactive pills, court pricing rows |
| surface-200 | #e5e2db | **All borders**, dividers, separators, card outlines |
| surface-800 | #292017 | **Body text**, labels, descriptions |
| surface-900 | #1a1410 | **Headings**, hero gradient base, footer bg, sidebar bg |

### Semantic Status Colors

**Booking status badges**:
```
confirmed:  bg-emerald-50 text-emerald-800, dot: bg-emerald-500
cancelled:  bg-red-50 text-red-800, dot: bg-red-500
completed:  bg-surface-100 text-surface-800, dot: bg-gray-400
no_show:    bg-amber-50 text-amber-800, dot: bg-amber-500
```

**Booking source badges**:
```
online:     bg-blue-50 text-blue-800, dot: bg-blue-500
walkin:     bg-brand-50 text-brand-800, dot: bg-brand-400
phone:      bg-purple-50 text-purple-800, dot: bg-purple-500
```

**Venue status badges**:
```
pending:    bg-amber-50 text-amber-800, dot: bg-amber-500
approved:   bg-emerald-50 text-emerald-800, dot: bg-emerald-500
rejected:   bg-red-50 text-red-800, dot: bg-red-500
suspended:  bg-surface-100 text-surface-800, dot: bg-gray-400
```

**Slot states**:
```
available:  bg-white border-surface-200 text-surface-800, hover:border-brand-400 hover:bg-brand-50
selected:   bg-brand-600 text-white border-brand-600 ring-2 ring-brand-300
booked:     bg-surface-100 text-surface-800/30 border-surface-200 line-through cursor-not-allowed
blocked:    same as booked
```

**Dashboard stat card accents**:
```
blue:    bg-blue-50, icon text-blue-600 (Calendar / bookings)
green:   bg-emerald-50, icon text-emerald-600 (IndianRupee / revenue)
orange:  bg-brand-50, icon text-brand-600 (TrendingUp / monthly)
purple:  bg-purple-50, icon text-purple-600 (Users / customers)
```

### Special
```
Star rating:     text-amber-500 fill-amber-500 (Star icon from lucide)
Hero gradient:   from-surface-900 via-brand-900 to-surface-900
Footer bg:       bg-surface-900 (#1a1410)
Owner sidebar:   bg-surface-900 (#1a1410)
Admin sidebar:   bg-surface-800 (#292017), red accent
```

---

## Typography

### Font Setup

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
}
```

### Tailwind Config
```js
fontFamily: {
  display: ['var(--font-display)', 'system-ui', 'sans-serif'],
  body: ['var(--font-body)', 'system-ui', 'sans-serif'],
}
```

### Usage Rules

| Element | Font | Classes |
|---------|------|---------|
| Page headings (h1) | Space Grotesk | `font-display font-bold text-2xl sm:text-3xl text-surface-900` |
| Section headings (h2) | Space Grotesk | `font-display font-bold text-xl text-surface-900` |
| Card titles | Space Grotesk | `font-display font-semibold text-surface-900` |
| Body text | DM Sans | default — `text-surface-800` |
| Muted / secondary | DM Sans | `text-sm text-surface-800/60` |
| Prices | Space Grotesk | `font-display font-semibold text-brand-700` or `font-bold` |
| Tags / badges | DM Sans | `text-xs font-medium` |
| Table headers | DM Sans | `text-sm font-medium text-surface-800/50` |
| Mono (booking codes) | system mono | `font-mono text-xs text-surface-800/70` |

---

## Component Patterns

### Cards
```
bg-white rounded-xl border border-surface-200
hover:shadow-lg hover:border-brand-200 transition-all duration-300
```

### Buttons

| Variant | Classes |
|---------|---------|
| Primary | `bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 rounded-lg font-medium transition-all focus:ring-2 focus:ring-brand-400 focus:ring-offset-2` |
| Secondary | `bg-surface-100 text-surface-800 hover:bg-surface-200 rounded-lg` |
| Outline | `border border-brand-600 text-brand-600 hover:bg-brand-50 rounded-lg` |
| Ghost | `text-surface-800 hover:bg-surface-100 rounded-lg` |

Sizes: sm (`text-sm px-3 py-1.5`), md (`text-sm px-4 py-2.5`), lg (`text-base px-6 py-3`)

### Inputs
```
w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm
focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
placeholder:text-surface-800/40
```

With icon: add `pl-10` and position icon `absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40`

### Layout
```
Page container:   max-w-7xl mx-auto px-4 sm:px-6
Section spacing:  py-12 or py-16
Card padding:     p-4 or p-5
```

### Responsive
```
Mobile first. Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
Common grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

---

## Tailwind Config (full extend block)

```js
// tailwind.config.ts → theme.extend
{
  colors: {
    brand: {
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
      400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
      800: '#9a3412', 900: '#7c2d12',
    },
    surface: {
      0: '#ffffff', 50: '#fafaf8', 100: '#f4f3f0', 200: '#e5e2db',
      800: '#292017', 900: '#1a1410',
    },
  },
  fontFamily: {
    display: ['var(--font-display)', 'system-ui', 'sans-serif'],
    body: ['var(--font-body)', 'system-ui', 'sans-serif'],
  },
}
```
