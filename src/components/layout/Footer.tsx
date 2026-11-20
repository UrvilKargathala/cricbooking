'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full bg-white px-3 sm:px-5 md:px-7 pt-4 pb-6 sm:pb-8" data-name="Footer">
      {/* Purpose-built mobile layout: percentage-positioned artwork does not scale reliably below tablet width. */}
      <div className="md:hidden relative overflow-hidden rounded-[24px] bg-[#020B08] px-5 py-7 text-white shadow-2xl">
        <Image src="/figma/footer-stadium-panoramic-master.png" alt="" fill className="object-cover object-center opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020b08]/75 via-[#020b08]/90 to-[#020b08]" />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C7FF00]">Match night starts here</p>
          <h2 className="mt-2 text-[32px] font-black italic leading-none tracking-tight">READY TO <span className="text-[#C7FF00]">PLAY?</span></h2>
          <p className="mt-3 max-w-[290px] text-[14px] leading-relaxed text-[#C5D0CB]">Find your perfect turf, choose your slot, and get the game started.</p>
          <div className="mt-4 flex items-center gap-2 text-[12px]"><span className="size-2 rounded-full bg-[#C7FF00] shadow-[0_0_10px_#C7FF00]" /><span className="font-semibold text-[#C7FF00]">8 courts</span><span className="text-white/70">available tonight in Surat</span></div>
          <Link href="/venues" className="mt-5 flex items-center justify-between rounded-full bg-[#C7FF00] px-5 py-3 text-[14px] font-bold text-[#020B08] transition-transform active:scale-[0.98]"><span>Find a Turf</span><ArrowRight size={17} /></Link>

          <div className="mt-8 border-t border-white/10 pt-6">
            <Image src="/figma/footer-logo-hires.png" alt="CricBooking®" width={180} height={50} className="h-10 w-auto object-contain" />
            <p className="mt-3 text-[13px] leading-relaxed text-[#C5D0CB]">Surat’s easiest way to book a turf and score your match.</p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
            <nav><p className="text-[11px] font-bold tracking-[0.12em] text-[#C7FF00]">EXPLORE</p><div className="mt-3 flex flex-col gap-2.5 text-[13px] text-[#C5D0CB]"><Link href="/venues">Find venues</Link><Link href="/#live-scores">Live scores</Link><Link href="/bookings">My bookings</Link><Link href="/how-it-works">How it works</Link></div></nav>
            <nav><p className="text-[11px] font-bold tracking-[0.12em] text-[#C7FF00]">MORE</p><div className="mt-3 flex flex-col gap-2.5 text-[13px] text-[#C5D0CB]"><Link href="/list-venue">List your venue</Link><Link href="/blog">Blog</Link><Link href="/contact">Contact</Link><Link href="/login">Log in</Link></div></nav>
          </div>

          <div className="mt-7 border-t border-white/10 pt-6"><p className="text-[11px] font-bold tracking-[0.12em] text-[#C7FF00]">GET IN TOUCH</p><div className="mt-3 space-y-2.5 text-[13px] text-[#C5D0CB]"><a href="tel:+919427508129" className="flex items-center gap-2"><Phone size={14} className="text-[#C7FF00]" />+91 94275 08129</a><a href="mailto:support@cricbooking.in" className="flex items-center gap-2"><Mail size={14} className="text-[#C7FF00]" />support@cricbooking.in</a><p className="flex items-center gap-2"><MapPin size={14} className="text-[#C7FF00]" />Amroli, Surat, Gujarat</p></div></div>
          <a href="https://wa.me/919427508129?text=Hi%20CricBooking%2C%20I%20want%20to%20book%20a%20turf%20in%20Surat" target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-between rounded-full border border-[#C7FF00]/40 bg-white/5 px-4 py-3 text-[13px] font-semibold text-white"><span>WhatsApp booking / inquiry</span><ArrowRight size={15} className="text-[#C7FF00]" /></a>
          <div className="mt-7 flex flex-wrap gap-x-3 gap-y-2 border-t border-white/10 pt-5 text-[11px] text-white/50"><span>© 2026 CricBooking.</span><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div>
        </div>
      </div>

      {/*
        ============================================================
        OUTER CONTAINER
        Exact aspect ratio 1024 / 436 (2.3486:1) matching reference.
        The panoramic stadium background artwork fills this container.
        ============================================================
      */}
      <div
        className="hidden md:block w-full max-w-[1440px] mx-auto rounded-[24px] sm:rounded-[32px] relative overflow-hidden shadow-2xl"
        style={{
          backgroundColor: '#020B08',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          isolation: 'isolate',
          aspectRatio: '1024 / 436',
        }}
      >
        {/* ============================================================
            BACKGROUND: Flawless, pristine stadium artwork (2048×872 @2x)
            - Glowing curved canopy arch
            - Single glowing neon-lime CTA card border & glassy interior
            - Bright lime "Find a Turf" button frame
            - Floodlights, stands and night crowd
            - Red cricket ball sitting on illuminated synthetic turf
            - White diagonal crease line
            - Clean social icon frames, WhatsApp pill frame & divider lines
            ============================================================ */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-[inherit]"
        >
          <Image
            src="/figma/footer-stadium-panoramic-master.png"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
        </div>

        {/* ============================================================
            INTERACTIVE VECTOR CONTENT LAYER
            Every element placed with percentage coordinates matching the 1024x436 reference.
            ============================================================ */}
        <div className="absolute inset-0 z-10 select-none">

          {/* ── 1. CTA CARD: "READY TO PLAY?" & BRUSH UNDERLINE ───────
              x ≈ 6.3%..41%, y ≈ 17.5%..32.5%
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col justify-center"
            style={{
              top: '17.2%',
              left: '6.3%',
              width: '35%',
            }}
          >
            <div className="relative w-fit">
              <h2
                className="font-black italic uppercase leading-none tracking-tight whitespace-nowrap m-0 flex items-center"
                style={{
                  fontSize: 'clamp(26px, 3.2vw, 45px)',
                  letterSpacing: '-1.2px',
                  lineHeight: 0.95,
                }}
              >
                <span className="text-white">READY TO&nbsp;</span>
                <span
                  style={{
                    color: '#C7FF00',
                    textShadow: '0 0 20px rgba(199,255,0,0.5)',
                  }}
                >
                  PLAY?
                </span>
              </h2>

              {/* Lime brush underline directly under "PLAY?" */}
              <div
                className="absolute right-0"
                style={{
                  top: '100%',
                  marginTop: '3px',
                  width: 'clamp(75px, 9.0vw, 128px)',
                }}
              >
                <Image
                  src="/figma/footer-brush-hires.png"
                  alt=""
                  width={130}
                  height={12}
                  className="object-contain"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          </div>

          {/* ── 2. CTA CARD: SUPPORTING TEXT ───────────────────────────
              x ≈ 44.9%..69%, y ≈ 18.6%..25.5%
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col justify-center"
            style={{
              top: '18.6%',
              left: '44.9%',
              width: '25%',
            }}
          >
            <p
              className="font-normal italic leading-snug m-0"
              style={{
                fontSize: 'clamp(11.5px, 1.0vw, 14.5px)',
                color: '#C5D0CB',
              }}
            >
              Find your perfect turf, choose your slot,
              <br />
              and get the game started.
            </p>
          </div>

          {/* ── 3. CTA CARD: LIVE COURT BADGE TEXT OVERLAY ────────────
              x ≈ 47.6%..68%, y ≈ 29.5%..32.5% (sits inside the pill next to glowing dot)
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex items-center gap-1.5 pointer-events-none"
            style={{
              top: '29.5%',
              left: '47.6%',
              height: '3.5%',
              fontSize: 'clamp(10px, 0.88vw, 12.5px)',
            }}
          >
            <span className="text-[#C7FF00] font-bold">8 courts</span>
            <span className="text-[#E0E6E4] font-normal">available for tonight in Surat</span>
          </div>

          {/* ── 4. CTA CARD: "FIND A TURF →" BUTTON OVERLAY ───────────
              x = 72.0%..86.0%, y = 21.3%..30.0% (sits on bright lime pill)
              ─────────────────────────────────────────────────────────── */}
          <Link
            href="/venues"
            className="group absolute flex items-center justify-center gap-2 font-bold transition-transform duration-200 hover:scale-105 active:scale-95 text-black no-underline"
            style={{
              left: '72.0%',
              top: '21.3%',
              width: '14.0%',
              height: '8.7%',
              borderRadius: '999px',
              fontSize: 'clamp(12px, 1.0vw, 14.5px)',
            }}
          >
            <span>Find a Turf</span>
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          {/* ── 5. COL 1 — CRICBOOKING BRAND & TAGLINE ────────────────
              x ≈ 5.6%..24%, y ≈ 42.2%..67%
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col gap-2.5"
            style={{
              left: '5.6%',
              top: '42.2%',
              width: '18.5%',
            }}
          >
            {/* Logo */}
            <Link href="/" className="inline-block w-fit">
              <Image
                src="/figma/footer-logo-hires.png"
                alt="CricBooking®"
                width={210}
                height={58}
                className="object-contain w-auto h-[clamp(40px,4.0vw,56px)]"
                priority
              />
            </Link>

            {/* Tagline */}
            <p
              className="font-normal leading-relaxed m-0"
              style={{
                fontSize: 'clamp(11.5px, 0.95vw, 14px)',
                color: '#C5D0CB',
                maxWidth: '225px',
              }}
            >
              Surat’s easiest way to book a turf
              <br />
              and score your match.
            </p>

            {/* Lime decorative accent line */}
            <div
              style={{
                width: '38px',
                height: '2px',
                borderRadius: '99px',
                background: '#C7FF00',
                boxShadow: '0 0 8px rgba(199,255,0,0.6)',
                marginTop: '1px',
              }}
            />
          </div>

          {/* ── 6. SOCIAL MEDIA ICONS (centered inside the 3 glass frames) ──
              x = 5.4%..18.5%, y = 69.5%..77.5%
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex items-center justify-between"
            style={{
              left: '5.4%',
              top: '69.5%',
              width: '13.3%',
              height: '8.5%',
            }}
          >
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center justify-center text-white hover:text-[#C7FF00] transition-colors"
              style={{ width: '31%', height: '100%' }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex items-center justify-center text-white hover:text-[#C7FF00] transition-colors"
              style={{ width: '31%', height: '100%' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex items-center justify-center text-white hover:text-[#C7FF00] transition-colors"
              style={{ width: '31%', height: '100%' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>

          {/* ── 7. COL 2 — EXPLORE ──────────────────────────────────────
              x ≈ 29.5%..42.5%, y ≈ 42.5%..75%
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col gap-2.5"
            style={{
              left: '29.5%',
              top: '42.5%',
              width: '13.5%',
            }}
          >
            <span
              className="font-bold uppercase tracking-wider text-white"
              style={{
                fontSize: 'clamp(11.5px, 0.98vw, 14px)',
                letterSpacing: '0.08em',
              }}
            >
              EXPLORE
            </span>

            <nav className="flex flex-col gap-2.5 pt-0.5">
              {[
                { label: 'Find venues', href: '/venues' },
                { label: 'Live scores', href: '/#live-scores' },
                { label: 'My bookings', href: '/bookings' },
                { label: 'How it works', href: '/how-it-works' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="group inline-flex items-center gap-2 transition-colors duration-150 w-fit no-underline"
                  style={{
                    color: '#C5D0CB',
                    fontSize: 'clamp(11.5px, 0.95vw, 14px)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#C5D0CB' }}
                >
                  <span
                    className="font-bold transition-transform duration-150 group-hover:translate-x-0.5"
                    style={{ color: '#C7FF00', fontSize: '13px', lineHeight: 1 }}
                  >
                    ›
                  </span>
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* ── 8. COL 3 — MORE ─────────────────────────────────────────
              x ≈ 46.0%..59.0%, y ≈ 42.5%..75%
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col gap-2.5"
            style={{
              left: '46.0%',
              top: '42.5%',
              width: '13.5%',
            }}
          >
            <span
              className="font-bold uppercase tracking-wider text-white"
              style={{
                fontSize: 'clamp(11.5px, 0.98vw, 14px)',
                letterSpacing: '0.08em',
              }}
            >
              MORE
            </span>

            <nav className="flex flex-col gap-2.5 pt-0.5">
              {[
                { label: 'List your venue', href: '/list-venue' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' },
                { label: 'Log in', href: '/login' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="group inline-flex items-center gap-2 transition-colors duration-150 w-fit no-underline"
                  style={{
                    color: '#C5D0CB',
                    fontSize: 'clamp(11.5px, 0.95vw, 14px)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#C5D0CB' }}
                >
                  <span
                    className="font-bold transition-transform duration-150 group-hover:translate-x-0.5"
                    style={{ color: '#C7FF00', fontSize: '13px', lineHeight: 1 }}
                  >
                    ›
                  </span>
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* ── 9. COL 4 — GET IN TOUCH ─────────────────────────────────
              x ≈ 61.8%..84.5%, y ≈ 42.5%..67%
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col gap-2.5"
            style={{
              left: '61.8%',
              top: '42.5%',
              width: '23.5%',
            }}
          >
            <span
              className="font-bold uppercase tracking-wider text-white"
              style={{
                fontSize: 'clamp(11.5px, 0.98vw, 14px)',
                letterSpacing: '0.08em',
              }}
            >
              GET IN TOUCH
            </span>

            {/* Contact details */}
            <div className="flex flex-col gap-2 pt-0.5">
              {/* Phone */}
              <a
                href="tel:+919427508129"
                className="inline-flex items-center gap-2 transition-colors duration-150 w-fit font-medium text-white hover:text-[#C7FF00] no-underline"
                style={{ fontSize: 'clamp(11.5px, 0.95vw, 14px)' }}
              >
                <Phone size={13} className="text-[#C7FF00] shrink-0" />
                <span>+91 94275 08129</span>
              </a>

              {/* Email */}
              <a
                href="mailto:support@cricbooking.in"
                className="inline-flex items-center gap-2 transition-colors duration-150 w-fit hover:text-[#C7FF00] no-underline"
                style={{
                  color: '#C5D0CB',
                  fontSize: 'clamp(11.5px, 0.95vw, 14px)',
                }}
              >
                <Mail size={13} className="text-[#C7FF00] shrink-0" />
                <span>support@cricbooking.in</span>
              </a>

              {/* Location */}
              <div
                className="inline-flex items-center gap-2"
                style={{
                  color: '#C5D0CB',
                  fontSize: 'clamp(11.5px, 0.95vw, 14px)',
                }}
              >
                <MapPin size={13} className="text-[#C7FF00] shrink-0" />
                <span>Amroli, Surat, Gujarat</span>
              </div>
            </div>
          </div>

          {/* ── 10. WHATSAPP BUTTON OVERLAY (centered inside the glowing pill) ──
              x = 61.8%..84.4%, y = 69.2%..78.5%
              ─────────────────────────────────────────────────────────── */}
          <a
            href="https://wa.me/919427508129?text=Hi%20CricBooking%2C%20I%20want%20to%20book%20a%20turf%20in%20Surat"
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute flex items-center justify-between px-3.5 transition-transform duration-200 hover:scale-[1.02] no-underline"
            style={{
              left: '61.8%',
              top: '69.2%',
              width: '22.6%',
              height: '9.5%',
              borderRadius: '999px',
            }}
          >
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#C7FF00" className="shrink-0">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.531 1.897.818 2.802.818 3.18 0 5.767-2.587 5.767-5.766.001-3.181-2.585-5.768-5.767-5.768zm0 10.378c-.808 0-1.636-.217-2.368-.652l-.17-.101-1.758.461.469-1.714-.111-.177c-.477-.76-.73-1.644-.73-2.562 0-2.628 2.138-4.766 4.766-4.766 2.627 0 4.766 2.138 4.767 4.766 0 2.628-2.139 4.767-4.765 4.767z" />
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.662 1.45 5.184L2 22l4.98-1.306C8.423 21.536 10.153 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.633 0-3.176-.466-4.498-1.275l-.322-.198-3.084.809.823-3.007-.217-.346C3.824 14.887 3.333 13.484 3.333 12c0-4.779 3.888-8.667 8.667-8.667 4.778 0 8.667 3.888 8.667 8.667 0 4.779-3.889 8.667-8.667 8.667z" />
              </svg>
              <span className="font-medium text-white group-hover:text-[#C7FF00] transition-colors whitespace-nowrap text-[clamp(10.5px,0.88vw,13px)]">
                Instant WhatsApp booking / inquiry
              </span>
            </div>
            <ArrowRight size={13} className="text-[#C7FF00] shrink-0 transition-transform group-hover:translate-x-0.5 ml-1" />
          </a>

          {/* ── 11. BOTTOM LEGAL BAR ────────────────────────────────────
              y ≈ 89.2%..92.5% (sits right above grass turf)
              ─────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex items-center justify-between"
            style={{
              left: '4.7%',
              right: '4.7%',
              top: '89.2%',
              fontSize: 'clamp(9.5px, 0.82vw, 12px)',
              color: '#AAB5B1',
            }}
          >
            <p className="m-0">© 2026 CricBooking. Made in Surat.</p>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/terms" className="hover:text-white transition-colors text-[#AAB5B1] no-underline">
                Terms
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
              <Link href="/privacy" className="hover:text-white transition-colors text-[#AAB5B1] no-underline">
                Privacy
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
              <Link href="/terms" className="hover:text-white transition-colors text-[#AAB5B1] no-underline">
                Style Guide
              </Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
