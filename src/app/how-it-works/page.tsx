'use client'

import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const STEPS = [
  {
    number: '01',
    title: 'Pick a turf',
    description:
      'Filter by area, price, floodlights and late timings. Every slot you see is live from the venue, so there is no double booking and no guessing.',
  },
  {
    number: '02',
    title: 'Choose your hour',
    description:
      'Pick the court and the hours you want. Every price is shown upfront, with no platform booking fee.',
  },
  {
    number: '03',
    title: 'Pay and play',
    description:
      'Pay in seconds with UPI, card or net banking. Your booking ticket with a QR code is ready instantly.',
  },
]

const PLAYER_PERKS = [
  'Verified turfs across Surat (Vesu, Varachha, Adajan, Katargam, Pal)',
  'Real-time slot calendar with immediate confirmation',
  'Save favourite turfs and rebook in a couple of taps',
  'Transparent pricing with no platform booking fee',
  'Easy cancellation and refund policy per venue rules',
]

const OWNER_PERKS = [
  'Free listing for any verified cricket turf in Surat',
  'Fill empty weekday morning and afternoon hours',
  'Online payments by UPI, card and net banking through Razorpay',
  'New bookings appear in your dashboard the moment they are paid',
  'Complete owner dashboard to block slots, track revenue and manage courts',
]

export default function HowItWorksPage() {
  return (
    <div className="bg-[#f7f9f7] min-h-screen text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-14">
        {/* Title Header */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#061923] px-6 py-10 sm:px-12 sm:py-14 mb-12 sm:mb-16">
          <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#F59E0B]/10 blur-3xl" />
          <div className="relative max-w-[760px]"><div className="bg-[#F59E0B] text-[#042644] px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] w-fit mb-5">Simple & transparent</div>
          <h1 className="text-[38px] sm:text-[54px] font-semibold tracking-[-0.05em] leading-[1.05] text-white">Three simple taps from discovery to the <span className="text-[#FBBF24]">pitch.</span></h1>
          <p className="text-[16px] sm:text-[18px] text-white/70 mt-5 leading-relaxed">
            No endless phone calls to turf managers and no arriving to find someone else on the court. CricBooking shows you the real open slots and books them instantly.
          </p></div>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 sm:mb-24">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className={`rounded-[24px] p-8 flex flex-col justify-between min-h-[260px] transition-transform duration-300 hover:-translate-y-1 ${
                idx === 0
                  ? 'bg-white border border-[#e3e5e8]'
                  : idx === 1
                  ? 'bg-[#eef1f4]'
                  : 'bg-[#042644] text-white'
              }`}
            >
              <span className={`text-[54px] sm:text-[64px] font-medium tracking-tighter leading-none ${idx === 2 ? 'text-[#FBBF24]' : 'text-[#1849c9]'}`}>
                {step.number}
              </span>
              <div>
                <h3 className={`text-[22px] font-medium tracking-tight ${idx === 2 ? 'text-white' : 'text-black'}`}>{step.title}</h3>
                <p className={`text-[14px] mt-2 leading-relaxed ${idx === 2 ? 'text-white/70' : 'text-[#50555c]'}`}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Players vs Owners Split Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 sm:mb-24">
          {/* Players */}
          <div className="bg-white border border-[#e3e5e8] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 flex flex-col justify-between gap-8 shadow-[0_16px_36px_rgb(4_38_68_/_0.06)]">
            <div>
              <span className="bg-[#F59E0B] text-black px-3 py-1 rounded-full text-[12px] font-medium">
                For Players
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-normal text-black mt-4 tracking-tight">
                Designed for cricketers who hate wasted time.
              </h2>
              <ul className="flex flex-col gap-3 mt-6">
                {PLAYER_PERKS.map((perk, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-[#404449]">
                    <span className="size-5 rounded-full bg-black text-[#FBBF24] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/venues"
              className="group bg-black hover:bg-neutral-800 transition-colors text-white pl-6 pr-2 py-3 rounded-full text-[15px] font-medium inline-flex items-center justify-between w-fit mt-4"
            >
              <span>Explore turfs</span>
              <span className="size-8 rounded-full bg-[#F59E0B] text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5 ml-4">
                <ArrowUpRight className="size-4" strokeWidth={2.5} />
              </span>
            </Link>
          </div>

          {/* Owners */}
          <div className="relative overflow-hidden bg-[#042644] text-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 flex flex-col justify-between gap-8 shadow-[0_18px_42px_rgb(4_38_68_/_0.16)]">
            <div className="absolute -right-20 -bottom-24 size-72 rounded-full bg-[#F59E0B]/10 blur-3xl" />
            <div>
              <span className="bg-[#F59E0B] text-black px-3 py-1 rounded-full text-[12px] font-medium">
                For Turf Owners
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-normal text-white mt-4 tracking-tight">
                Fill courts, take online payments, track earnings.
              </h2>
              <ul className="flex flex-col gap-3 mt-6">
                {OWNER_PERKS.map((perk, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-white/80">
                    <span className="size-5 rounded-full bg-[#F59E0B] text-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/list-venue"
              className="group bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium inline-flex items-center justify-between w-fit mt-4"
            >
              <span>List your venue free</span>
              <span className="size-8 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover:translate-x-0.5 ml-4">
                <ArrowUpRight className="size-4" strokeWidth={2.5} />
              </span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
