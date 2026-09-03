export interface BlogPost {
  slug: string
  title: string
  category: 'Tips' | 'Guide' | 'Spotlight' | 'Fitness' | 'News'
  excerpt: string
  image: string
  author: string
  date: string
  readTime: string
  body: { type: 'p' | 'h2' | 'li'; text: string }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'top-10-box-cricket-venues-surat-2026',
    title: 'Top 10 Box Cricket Venues in Surat (2026)',
    category: 'Tips',
    excerpt: 'From Vesu to Katargam, we round up the best box cricket arenas in the city — floodlit, well-maintained, and easy to book.',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80',
    author: 'CricBooking Team',
    date: '2026-08-12',
    readTime: '5 min read',
    body: [
      { type: 'p', text: 'Box cricket has exploded across Surat over the last few years, and with good reason — it fits into a lunch break, needs a smaller crew than an eleven-a-side match, and most grounds now have proper floodlights for evening games.' },
      { type: 'h2', text: 'What makes a good box cricket venue' },
      { type: 'p', text: 'Before ranking venues, it helps to know what actually separates a good ground from a mediocre one. Surface quality, net height, floodlight coverage, and how quickly the owner responds to booking requests all matter more than flashy branding.' },
      { type: 'li', text: 'Astro-turf or matting in good condition, replaced at least once every two years' },
      { type: 'li', text: 'Floodlights bright enough for evening play without glare' },
      { type: 'li', text: 'Clean changing rooms and drinking water on site' },
      { type: 'li', text: 'Transparent, upfront pricing with no last-minute add-ons' },
      { type: 'h2', text: 'Our picks across the city' },
      { type: 'p', text: 'Vesu and Adajan continue to lead on venue density, but Varachha and Katargam have both added new turfs this year that are worth a look if you play on the east side of the city. Check real-time availability on the venues page before heading out.' },
    ],
  },
  {
    slug: 'organize-corporate-cricket-tournament',
    title: 'How to Organize a Corporate Cricket Tournament',
    category: 'Guide',
    excerpt: 'A practical playbook for HR teams and team leads planning an inter-department or inter-company cricket tournament.',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80',
    author: 'CricBooking Team',
    date: '2026-07-28',
    readTime: '7 min read',
    body: [
      { type: 'p', text: 'Corporate cricket tournaments are a reliable way to build cross-team relationships outside the office, but they fall apart quickly without a clear plan for venues, scheduling, and rules.' },
      { type: 'h2', text: 'Start with the venue, not the fixtures' },
      { type: 'p', text: 'Lock in a ground before you announce dates. Multi-court venues let you run two matches in parallel, which matters once you have more than four teams — otherwise a single-day tournament stretches into a multi-week slog.' },
      { type: 'li', text: 'Book a venue with at least two courts for anything above 6 teams' },
      { type: 'li', text: 'Confirm floodlight availability if matches run past 6pm' },
      { type: 'li', text: 'Ask about group booking discounts — most venues offer one for 4+ hours' },
      { type: 'h2', text: 'Keep the format simple' },
      { type: 'p', text: 'A straight knockout bracket is easiest to explain and schedule. Save round-robin formats for tournaments with a dedicated coordinator tracking standings.' },
    ],
  },
  {
    slug: 'monsoon-cricket-indoor-venues-surat',
    title: 'Monsoon Cricket: Best Indoor Venues in Surat',
    category: 'Tips',
    excerpt: 'Rain doesn’t have to cancel game night. Here’s where to play covered box cricket during Surat’s monsoon months.',
    image: 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=1200&q=80',
    author: 'CricBooking Team',
    date: '2026-06-30',
    readTime: '4 min read',
    body: [
      { type: 'p', text: 'Surat gets serious rain between June and September, and an open turf booking can turn into a wasted evening if the skies open up. A fully covered or roofed ground removes that risk entirely.' },
      { type: 'h2', text: 'What to check before booking in monsoon' },
      { type: 'li', text: 'Confirm the ground is fully roofed, not just partially covered' },
      { type: 'li', text: 'Ask about drainage — some turfs get slippery even indoors after heavy humidity' },
      { type: 'li', text: 'Check the venue’s cancellation policy in case of extreme weather advisories' },
      { type: 'p', text: 'A handful of venues in Adajan and Vesu run fully enclosed box cricket arenas — filter by "Box Cricket" on the venues page and check the amenities list for "Covered" before booking during the season.' },
    ],
  },
  {
    slug: 'venue-spotlight-surat-cricket-arena-vesu',
    title: 'Venue Spotlight: Surat Cricket Arena, Vesu',
    category: 'Spotlight',
    excerpt: 'A closer look at one of Vesu’s most booked grounds — what it offers, what players say, and who it’s best for.',
    image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=1200&q=80',
    author: 'CricBooking Team',
    date: '2026-06-10',
    readTime: '4 min read',
    body: [
      { type: 'p', text: 'Surat Cricket Arena sits just off the main Vesu stretch and has become one of the most consistently booked grounds on the platform, largely on the strength of its pitch quality and floodlighting.' },
      { type: 'h2', text: 'What players like' },
      { type: 'li', text: 'Two well-maintained turf courts, both usable after dark' },
      { type: 'li', text: 'Dedicated parking, which is rare for the area' },
      { type: 'li', text: 'Consistent pricing with no weekend markup surprises' },
      { type: 'h2', text: 'Best for' },
      { type: 'p', text: 'Regular weekly groups who want a predictable, well-run ground more than a flashy one. Peak evening slots fill up fast, so book at least two days ahead if you want a specific time.' },
    ],
  },
  {
    slug: 'warm-up-exercises-before-box-cricket',
    title: '5 Warm-Up Exercises Before Your Box Cricket Match',
    category: 'Fitness',
    excerpt: 'Quick, no-equipment warm-ups that cut your injury risk before a fast-paced box cricket session.',
    image: 'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?w=1200&q=80',
    author: 'CricBooking Team',
    date: '2026-05-22',
    readTime: '3 min read',
    body: [
      { type: 'p', text: 'Box cricket is short and intense — lots of sudden sprints, dives, and throws in a compact space. A five-minute warm-up goes a long way toward avoiding a pulled hamstring in the first over.' },
      { type: 'li', text: 'Dynamic leg swings — 10 per side to loosen the hips' },
      { type: 'li', text: 'Arm circles and shoulder rolls before any throwing' },
      { type: 'li', text: 'Light jogging or shuttle runs for 2-3 minutes' },
      { type: 'li', text: 'Bodyweight lunges — 10 per leg' },
      { type: 'li', text: 'A few practice sprints at match intensity' },
      { type: 'p', text: 'None of this needs equipment, and it fits easily into the few minutes before your slot starts.' },
    ],
  },
  {
    slug: 'cricbooking-crosses-10000-bookings',
    title: 'CricBooking Crosses 10,000 Bookings!',
    category: 'News',
    excerpt: 'A quick thank-you to the Surat cricket community — and a look at what’s next for the platform.',
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1200&q=80',
    author: 'CricBooking Team',
    date: '2026-05-01',
    readTime: '2 min read',
    body: [
      { type: 'p', text: 'We just crossed 10,000 confirmed bookings across venues in Surat, and we wanted to take a moment to say thank you to every player, team captain, and venue owner who made that happen.' },
      { type: 'h2', text: 'What\'s next' },
      { type: 'p', text: 'We\'re working on faster slot updates, more venues across Athwa and Udhna, and better tools for owners to manage recurring bookings. If there\'s a feature you want to see, reach out — we read every message.' },
    ],
  },
]

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null
}
