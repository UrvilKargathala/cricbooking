'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full bg-white px-3 sm:px-6 pt-12 pb-6">
      <div className="max-w-[1240px] mx-auto bg-[#c9f13e] rounded-[32px] sm:rounded-[40px] px-6 sm:px-12 md:px-14 pt-10 sm:pt-14 pb-8 overflow-hidden flex flex-col gap-8 sm:gap-12 text-black">
        {/* Top Content Row */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          {/* Headline & CTA */}
          <div className="flex flex-col gap-6 max-w-[380px]">
            <h2 className="text-[28px] sm:text-[32px] font-normal tracking-[-0.9px] leading-[1.15] text-black font-['Geist']">
              Surat’s easiest way to book a turf and score your match.
            </h2>

            <Link
              href="/venues"
              className="group bg-black text-white pl-6 pr-2 py-2 rounded-full inline-flex items-center gap-3 text-[15px] font-medium w-fit hover:bg-neutral-800 transition-all active:scale-95 shadow-sm"
            >
              <span>Find a turf</span>
              <span className="size-9 rounded-full bg-[#c9f13e] text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="size-4" strokeWidth={2.5} />
              </span>
            </Link>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 w-full lg:w-auto">
            {/* Col 1 */}
            <div className="flex flex-col gap-2.5 text-[15px] font-normal">
              <Link href="/venues" className="hover:opacity-70 transition-opacity">
                Find venues
              </Link>
              <Link href="/#live-scores" className="hover:opacity-70 transition-opacity">
                Live scores
              </Link>
              <Link href="/bookings" className="hover:opacity-70 transition-opacity">
                My bookings
              </Link>
              <Link href="/how-it-works" className="hover:opacity-70 transition-opacity">
                How it works
              </Link>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col gap-2.5 text-[15px] font-normal">
              <Link href="/list-venue" className="hover:opacity-70 transition-opacity">
                List your venue
              </Link>
              <Link href="/blog" className="hover:opacity-70 transition-opacity">
                Blog
              </Link>
              <Link href="/contact" className="hover:opacity-70 transition-opacity">
                Contact
              </Link>
              <Link href="/login" className="hover:opacity-70 transition-opacity">
                Log in
              </Link>
            </div>

            {/* Col 3: Contact details */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-2.5 text-[15px]">
              <a
                href="tel:+919427508129"
                className="text-[18px] sm:text-[20px] font-medium tracking-tight hover:opacity-70 transition-opacity"
              >
                +91 94275 08129
              </a>
              <a
                href="mailto:support@cricbooking.in"
                className="hover:opacity-70 transition-opacity"
              >
                support@cricbooking.in
              </a>
              <span className="opacity-80">Amroli, Surat, Gujarat</span>
            </div>
          </div>
        </div>

        {/* Massive Brand Watermark */}
        <div className="w-full text-center py-2 select-none pointer-events-none overflow-hidden">
          <p className="text-[64px] sm:text-[110px] md:text-[150px] lg:text-[196px] font-medium tracking-[-0.06em] leading-[0.8] text-black/90 font-['Geist'] block whitespace-nowrap">
            CricBooking®
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-black/15 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] sm:text-[14px]">
          <p className="opacity-90">© 2026 CricBooking. Made in Surat.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="underline hover:opacity-70 transition-opacity">
              Terms
            </Link>
            <Link href="/privacy" className="underline hover:opacity-70 transition-opacity">
              Privacy
            </Link>
            <Link href="/#faq" className="underline hover:opacity-70 transition-opacity">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
