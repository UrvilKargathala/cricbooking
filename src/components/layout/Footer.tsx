'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { fetchAreas } from '@/lib/supabase-queries'
import type { Area } from '@/types'

const EXPLORE_LINKS = [
  { name: 'All Venues', href: '/venues' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Blog', href: '/blog' },
]

const OWNER_LINKS = [
  { name: 'List Your Venue', href: '/list-venue' },
]

export function Footer() {
  const { user } = useAuth()
  const [areas, setAreas] = useState<Area[]>([])

  useEffect(() => {
    fetchAreas().then(setAreas).catch(() => {})
  }, [])

  const bookingLink = user
    ? { name: 'My Bookings', href: '/bookings' }
    : { name: 'Login', href: '/login' }

  return (
    <footer className="bg-surface-900 text-surface-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="logo-mark w-8 h-8 text-brand-500" />
              <span className="font-display font-bold text-white">CricBooking</span>
            </div>
            <p className="text-sm text-surface-200/50 leading-relaxed max-w-[220px]">
              Book sports venues across Surat with real-time availability and instant confirmation.
            </p>
            <div className="flex flex-col gap-2 mt-5 text-sm text-surface-200/60">
              <a href="mailto:hello@cricbooking.com" className="flex items-center gap-2 hover:text-white transition-colors w-fit">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                hello@cricbooking.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Surat, Gujarat, India
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-surface-200/40 uppercase tracking-wider mb-4">Explore</h3>
            <ul className="flex flex-col gap-2.5">
              {[...EXPLORE_LINKS, bookingLink].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-surface-200/70 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-surface-200/40 uppercase tracking-wider mb-4">Areas</h3>
            <ul className="flex flex-col gap-2.5 max-h-40 overflow-hidden">
              {areas.slice(0, 6).map((area) => (
                <li key={area.slug}>
                  <Link href={`/venues?area=${area.slug}`} className="text-sm text-surface-200/70 hover:text-white transition-colors">
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-surface-200/40 uppercase tracking-wider mb-4">For Owners</h3>
            <ul className="flex flex-col gap-2.5">
              {OWNER_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-surface-200/70 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              {user?.role === 'owner' && (
                <li>
                  <Link href="/dashboard" className="text-sm text-surface-200/70 hover:text-white transition-colors">
                    Owner Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-10 pb-8 border-b border-white/10">
          <p className="text-sm text-surface-200/40 hidden sm:block">Ready for your next match?</p>
          <Link
            href="/venues"
            className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-700 transition-colors ml-auto"
          >
            Search Venues <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-200/40 order-2 sm:order-1">
            © {new Date().getFullYear()} CricBooking. All rights reserved.
          </p>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <Link href="/terms" className="text-xs text-surface-200/40 hover:text-surface-200/70">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-surface-200/40 hover:text-surface-200/70">Privacy Policy</Link>
          </div>
        </div>
      </div>

      <div className="select-none pointer-events-none -mt-2 sm:-mt-4">
        <p className="font-display font-black text-[18vw] sm:text-[11vw] leading-none text-white/5 whitespace-nowrap text-center tracking-tight">
          CricBooking
        </p>
      </div>
    </footer>
  )
}
