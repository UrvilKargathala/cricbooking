import Link from 'next/link'

const POPULAR_AREAS = [
  { name: 'Vesu', slug: 'vesu' },
  { name: 'Adajan', slug: 'adajan' },
  { name: 'Varachha', slug: 'varachha' },
  { name: 'Piplod', slug: 'piplod' },
  { name: 'Katargam', slug: 'katargam' },
]

const QUICK_LINKS = [
  { name: 'All Venues', href: '/venues' },
  { name: 'My Bookings', href: '/bookings' },
  { name: 'Login', href: '/login' },
]

const OWNER_LINKS = [
  { name: 'List Your Venue', href: '/list-venue' },
  { name: 'Owner Dashboard', href: '/dashboard' },
]

export function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo-icon.png" alt="" className="w-8 h-8" />
              <span className="font-display font-bold text-white">CricBooking</span>
            </div>
            <p className="text-sm text-surface-200/60">
              Book cricket turfs and grounds across Surat in seconds — real-time slots, instant confirmation.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-3">Popular Areas</h3>
            <ul className="flex flex-col gap-2">
              {POPULAR_AREAS.map((area) => (
                <li key={area.slug}>
                  <Link href={`/venues?area=${area.slug}`} className="text-sm text-surface-200/60 hover:text-white">
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-3">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-surface-200/60 hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-3">For Venue Owners</h3>
            <ul className="flex flex-col gap-2">
              {OWNER_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-surface-200/60 hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-surface-200/40">
            © {new Date().getFullYear()} CricBooking. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
