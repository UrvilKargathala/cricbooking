'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown, MapPin, Calendar } from 'lucide-react'
import type { Area } from '@/types'

interface HeroProps {
  areas: Area[]
  selectedArea: string
  setSelectedArea: (area: string) => void
  selectedTime: string
  setSelectedTime: (time: string) => void
  handleSearch: (e: React.FormEvent) => void
}

export function Hero({
  areas,
  selectedArea,
  setSelectedArea,
  selectedTime,
  setSelectedTime,
  handleSearch,
}: HeroProps) {
  return (
    <section
      className="relative w-full min-h-[670px] sm:h-[calc(100svh+84px)] sm:min-h-[calc(100vh+84px)] -mt-[78px] sm:-mt-[84px] pt-[78px] sm:pt-[84px] flex flex-col justify-between overflow-hidden select-none"
      style={{ backgroundColor: '#020B12' }}
    >
        {/* ============================================================
            BACKGROUND: Realistic Night Cricket Turf & Stadium
            - Floodlights with cinematic atmospheric glow
            - Realistic synthetic turf blades with stadium grass texture
            - Deep navy atmosphere (#020B12 to #042644)
            - Professional cricket batsman illuminated on the right side
            ============================================================ */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <Image
            src="/figma/hero-cricket-stadium.jpg"
            alt="Cricket Stadium Night Turf"
            fill
            priority
            className="object-cover object-right sm:object-center brightness-[0.92] contrast-[1.12]"
          />

          {/* Deep Navy Atmospheric Overlays for Guaranteed Text Legibility */}
          {/* Left vignette gradient for headline & booking bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B12] via-[#020B12]/85 to-transparent sm:w-[65%]" />
          {/* Bottom vignette gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020B12] via-[#020B12]/30 to-transparent h-full" />
          {/* Top subtle vignette for header backdrop */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#020B12]/85 via-[#020B12]/40 to-transparent" />

          {/* Dynamic stadium floodlight glow simulation */}
          <div className="absolute top-[8%] right-[15%] size-[420px] rounded-full bg-[#C9F13E]/10 blur-[100px] pointer-events-none animate-pulse" />
        </div>

        {/* Top spacer to ensure clean clearance below floating header */}
        <div className="h-4 sm:h-6 shrink-0" />

        {/* ============================================================
            HERO MAIN CONTENT CONTAINER
            Two-column composition on desktop/tablet, stacked on mobile
            ============================================================ */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 flex-1 flex flex-col justify-center py-7 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 lg:gap-12 w-full">
            {/* --------------------------------------------------------
                LEFT COLUMN:
                - Community Badge / Avatars
                - Main Headline (Large, bold, sporty, with #C9F13E accent)
                - Supporting text
                - Premium Floating Booking Bar (Where, When, Find Turf)
                -------------------------------------------------------- */}
            <div className="flex flex-col gap-3.5 sm:gap-5 max-w-[700px] w-full">
              {/* Top Avatars & Community Pill */}
              <div className="w-fit">
                <div className="backdrop-blur-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#C9F13E]/40 rounded-full p-1 pl-1 pr-4 inline-flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all">
                  <div className="flex -space-x-2">
                    <span className="size-7 sm:size-8 rounded-full bg-[#C9F13E] text-[#020B12] font-bold text-xs flex items-center justify-center border-2 border-[#020B12] shadow-sm">
                      UK
                    </span>
                    <span className="size-7 sm:size-8 rounded-full bg-[#e3ebfa] text-[#042644] font-bold text-xs flex items-center justify-center border-2 border-[#020B12] shadow-sm">
                      TD
                    </span>
                    <span className="size-7 sm:size-8 rounded-full bg-[#042644] text-white font-bold text-xs flex items-center justify-center border-2 border-[#020B12] shadow-sm">
                      DT
                    </span>
                  </div>
                  <span className="text-[12px] sm:text-[13.5px] text-white/90 font-normal tracking-wide">
                    Play more. Book faster. Join 500+ players in Surat.
                  </span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <h1 className="text-[38px] sm:text-[58px] md:text-[68px] lg:text-[76px] font-extrabold leading-[1.03] tracking-[-0.035em] text-white font-['Geist']">
                  Book a turf.{' '}
                  <span className="block text-white/95">Play tonight.</span>
                  <span className="inline-flex items-center flex-wrap gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <span>Score</span>
                    <span className="inline-block bg-[#C9F13E] text-[#020B12] px-3.5 sm:px-6 py-0.5 sm:py-1 rounded-[14px] sm:rounded-[18px] font-extrabold shadow-[0_0_30px_rgba(201,241,62,0.35)] tracking-tight">
                      every ball.
                    </span>
                  </span>
                </h1>

                {/* Supporting Text */}
                <p className="text-[15px] sm:text-[17px] text-white/80 max-w-[540px] leading-relaxed">
                  Real slots at real turfs across Surat. Pick a time, pay once, walk on.
                </p>
                <div className="flex w-fit items-center gap-3 rounded-xl border border-white/15 bg-[#05151e]/70 px-3 py-2 backdrop-blur-md">
                  <span className="relative flex size-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C9F13E] opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-[#C9F13E]" /></span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#C9F13E]">Tonight</span>
                  <span className="h-4 w-px bg-white/20" />
                  <span className="text-[12px] font-medium text-white">8 courts open across Surat</span>
                </div>
              </div>

              {/* Premium Floating Booking Control Bar */}
              <form
                onSubmit={handleSearch}
                className="backdrop-blur-2xl bg-white/95 text-black rounded-[24px] sm:rounded-full p-2.5 sm:p-2 pl-4 sm:pl-6 pr-2 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(201,241,62,0.12)] border border-white/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full max-w-[620px] transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_35px_rgba(201,241,62,0.18)]"
              >
                {/* Where Selector */}
                <div className="flex-1 px-2 py-0.5 group/where">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6c727d]">
                    <MapPin className="size-3 text-[#042644]" />
                    <span>Where</span>
                  </div>
                  <div className="relative flex items-center mt-0.5">
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full bg-transparent text-[14.5px] sm:text-[15px] font-semibold text-[#020B12] focus:outline-none cursor-pointer appearance-none pr-6 group-hover/where:text-[#042644] transition-colors"
                    >
                      <option value="">Area or venue in Surat</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.slug}>
                          {a.name}
                        </option>
                      ))}
                      {!areas.length && (
                        <>
                          <option value="vesu">Vesu</option>
                          <option value="varachha">Varachha</option>
                          <option value="adajan">Adajan</option>
                          <option value="katargam">Katargam</option>
                          <option value="pal">Pal</option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="size-4 text-[#8a919e] absolute right-0 pointer-events-none transition-transform group-hover/where:translate-y-0.5" />
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-neutral-200" />

                {/* When Selector */}
                <div className="flex-1 px-2 py-0.5 group/when">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6c727d]">
                    <Calendar className="size-3 text-[#042644]" />
                    <span>When</span>
                  </div>
                  <div className="relative flex items-center mt-0.5">
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-transparent text-[14.5px] sm:text-[15px] font-semibold text-[#020B12] focus:outline-none cursor-pointer appearance-none pr-6 group-hover/when:text-[#042644] transition-colors"
                    >
                      <option value="tonight">Tonight, 8 PM</option>
                      <option value="tomorrow">Tomorrow night</option>
                      <option value="weekend">This Weekend</option>
                      <option value="morning">Morning (6 - 10 AM)</option>
                    </select>
                    <ChevronDown className="size-4 text-[#8a919e] absolute right-0 pointer-events-none transition-transform group-hover/when:translate-y-0.5" />
                  </div>
                </div>

                {/* Find Turf CTA Button */}
                <button
                  type="submit"
                  className="group/btn bg-[#C9F13E] hover:bg-[#d6ff2b] text-[#020B12] pl-5 sm:pl-6 pr-3 sm:pr-3.5 py-2.5 rounded-full text-[14px] sm:text-[15px] font-bold flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(201,241,62,0.35)] hover:shadow-[0_6px_24px_rgba(201,241,62,0.55)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0"
                >
                  <span>Find Turf</span>
                  <span className="size-7 rounded-full bg-[#020B12] text-[#C9F13E] flex items-center justify-center transition-transform group-hover/btn:translate-x-1">
                    <ArrowRight className="size-3.5" strokeWidth={2.5} />
                  </span>
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-[12px] text-white/75">
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#C9F13E]" />Instant confirmation</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#C9F13E]" />₹0 booking fee</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#C9F13E]" />Secure UPI payments</span>
              </div>
            </div>

            {/* --------------------------------------------------------
                RIGHT COLUMN:
                - Live Match Card in Dark Glassmorphism
                - Replay Intro Animation button
                -------------------------------------------------------- */}
            <div className="flex flex-col items-start lg:items-end gap-3 mt-1 sm:mt-2 lg:mt-0">
              {/* Premium Dark Glassmorphism Live Match Card */}
              <Link
                href="/#live-scores"
                className="group backdrop-blur-2xl bg-[#020B12]/85 hover:bg-[#041728]/90 border border-[#C9F13E]/30 hover:border-[#C9F13E]/70 rounded-[18px] sm:rounded-[24px] p-3 sm:p-5 flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-3 shadow-[0_16px_40px_rgba(0,0,0,0.65),0_0_25px_rgba(201,241,62,0.12)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(201,241,62,0.22)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-[310px]"
              >
                {/* Header: Pulsing Live Indicator */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 bg-[#ff334b]/15 border border-[#ff334b]/30 px-3 py-1 rounded-full">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff334b] opacity-80" />
                      <span className="relative inline-flex rounded-full size-2 bg-[#ff334b] shadow-[0_0_8px_#ff334b]" />
                    </span>
                    <span className="text-[11px] font-bold text-[#ff6b7d] tracking-wider uppercase">
                      LIVE
                    </span>
                  </div>

                  <span className="hidden sm:inline text-[12px] text-white/50 group-hover:text-white/80 transition-colors">
                    Surat League
                  </span>
                </div>

                {/* Match count and live status */}
                <div>
                  <p className="text-[18px] sm:text-[26px] font-bold text-white tracking-tight leading-tight">
                    3 matches
                  </p>
                  <p className="text-[11px] sm:text-[13px] text-white/70 font-normal">
                    being scored right now
                  </p>
                </div>

                {/* Interaction Footer: View live scores -> */}
                <div className="hidden sm:flex pt-2 border-t border-white/10 items-center justify-between text-[12.5px] sm:text-[13px] text-[#C9F13E] font-semibold group-hover:text-white transition-colors">
                  <span>View live scores</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom spacing to anchor cleanly within 100svh */}
        <div className="h-6 sm:h-8 shrink-0" />
      </section>
  )
}
