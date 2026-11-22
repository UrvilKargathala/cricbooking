'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

const WHATSAPP_URL =
  'https://wa.me/919427508129?text=Hi%20CricBooking%2C%20I%20want%20to%20book%20a%20turf%20in%20Surat'

const LINK_GROUPS = [
  {
    title: 'Players',
    links: [
      { label: 'Find a turf', href: '/venues' },
      { label: 'Open slots tonight', href: '/venues?time=tonight' },
      { label: 'My bookings', href: '/bookings' },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
  {
    title: 'Turf owners',
    links: [
      { label: 'List your venue', href: '/list-venue' },
      { label: 'Owner dashboard', href: '/dashboard' },
      { label: 'How it works', href: '/how-it-works' },
    ],
  },
  {
    title: 'CricBooking',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Log in', href: '/login' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="w-full bg-white px-3 sm:px-6 lg:px-10 pt-4 pb-4 sm:pb-6" data-name="Footer">
      <div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#020B12] text-white">
        <Image
          src="/figma/hero-cricket-stadium.jpg"
          alt=""
          fill
          sizes="(max-width: 1440px) 100vw, 1360px"
          className="object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020B12]/70 via-[#020B12]/92 to-[#020B12]" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#F59E0B]/15 blur-3xl" />

        <div className="relative z-10 px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[720px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#FBBF24]">Match night starts here</p>
              <h2 className="mt-3 text-[34px] sm:text-[48px] font-semibold leading-[1.05] tracking-[-0.035em]">
                Ready to play? <span className="text-[#FBBF24]">Book your turf.</span>
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/70">
                Real open slots at turfs across Surat. Pick a time, pay online and walk on.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/venues"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-6 py-3.5 text-[15px] font-semibold text-[#020B12] transition-colors hover:bg-[#FBBF24]"
              >
                Find a turf
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-[#F59E0B]/60 hover:bg-white/10"
              >
                <MessageCircle className="size-4 text-[#FBBF24]" />
                WhatsApp us
              </a>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 border-t border-white/10 pt-10 sm:mt-12 md:grid-cols-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <Image src="/figma/logo-icon.svg" alt="" width={34} height={34} className="size-[34px]" />
                <span className="text-[22px] font-semibold tracking-tight">
                  Cric<span className="text-[#FBBF24]">Booking</span>
                </span>
              </Link>
              <p className="mt-4 max-w-[280px] text-[14px] leading-relaxed text-white/65">
                Surat&apos;s easiest way to find an open turf and book it in a minute.
              </p>
              <div className="mt-5 space-y-3 text-[14px] text-white/75">
                <a href="tel:+919427508129" className="flex items-center gap-2.5 hover:text-white">
                  <Phone className="size-4 shrink-0 text-[#FBBF24]" />
                  +91 94275 08129
                </a>
                <a href="mailto:support@cricbooking.in" className="flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-4 shrink-0 text-[#FBBF24]" />
                  support@cricbooking.in
                </a>
                <p className="flex items-center gap-2.5">
                  <MapPin className="size-4 shrink-0 text-[#FBBF24]" />
                  Amroli, Surat, Gujarat
                </p>
              </div>
            </div>

            {LINK_GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#FBBF24]">{group.title}</p>
                <ul className="mt-4 space-y-3 text-[14px] text-white/75">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} CricBooking. Made in Surat.</p>
            <div className="flex gap-5">
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/contact" className="hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
