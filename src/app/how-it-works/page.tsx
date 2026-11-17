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
      'Filter by area, price, turf surface and amenities. Every slot you see is checked in real-time — no double booking, no guessing.',
  },
  {
    number: '02',
    title: 'Choose your hour',
    description:
      'Pick the exact court and duration. See all prices upfront with ₹0 platform booking fee. Add player names for the live match.',
  },
  {
    number: '03',
    title: 'Pay and play',
    description:
      'Pay in seconds via UPI, card or net banking. Your ticket QR code and match scoring link are generated instantly.',
  },
]

const PLAYER_PERKS = [
  'Verified turfs across Surat (Vesu, Varachha, Adajan, Katargam, Pal)',
  'Real-time slot calendar with immediate confirmation',
  'Free live scoreboard for your match with shareable link',
  '100% transparent pricing — ₹0 platform fees, ever',
  'Easy cancellation and refund policy per venue rules',
]

const OWNER_PERKS = [
  'Free listing for any verified cricket turf in Surat',
  'Fill empty weekday morning and afternoon hours',
  'Direct UPI & Razorpay settlements with zero payment hassle',
  'Automated WhatsApp booking confirmations sent to players',
  'Complete owner dashboard to block slots, track revenue and manage courts',
]

export default function HowItWorksPage() {
  return (
    <div className="bg-white min-h-screen text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Title Header */}
        <div className="max-w-[760px] mb-12 sm:mb-16">
          <div className="bg-[#c9f13e] text-black px-3.5 py-1.5 rounded-full text-[13px] font-medium w-fit mb-4">
            Simple & Transparent
          </div>
          <h1 className="text-[38px] sm:text-[54px] font-normal tracking-[-1.68px] leading-[1.1] text-black">
            Three simple taps from discovery to the pitch.
          </h1>
          <p className="text-[16px] sm:text-[18px] text-[#50555c] mt-4 leading-relaxed">
            No endless phone calls to turf managers. No arriving to find someone else on the court. CricBooking connects you directly to live slots.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 sm:mb-24">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className={`rounded-[24px] p-8 flex flex-col justify-between min-h-[260px] ${
                idx === 0
                  ? 'bg-white border border-[#e3e5e8]'
                  : idx === 1
                  ? 'bg-[#eef1f4]'
                  : 'bg-[#e3ebfa]'
              }`}
            >
              <span className="text-[54px] sm:text-[64px] font-medium tracking-tighter text-[#1849c9] leading-none">
                {step.number}
              </span>
              <div>
                <h3 className="text-[22px] font-medium text-black tracking-tight">{step.title}</h3>
                <p className="text-[14px] text-[#50555c] mt-2 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Players vs Owners Split Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 sm:mb-24">
          {/* Players */}
          <div className="bg-[#f4f6f8] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 flex flex-col justify-between gap-8">
            <div>
              <span className="bg-[#c9f13e] text-black px-3 py-1 rounded-full text-[12px] font-medium">
                For Players
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-normal text-black mt-4 tracking-tight">
                Designed for cricketers who hate wasted time.
              </h2>
              <ul className="flex flex-col gap-3 mt-6">
                {PLAYER_PERKS.map((perk, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-[#404449]">
                    <span className="size-5 rounded-full bg-black text-[#c9f13e] flex items-center justify-center shrink-0 mt-0.5">
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
              <span className="size-8 rounded-full bg-[#c9f13e] text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5 ml-4">
                <ArrowUpRight className="size-4" strokeWidth={2.5} />
              </span>
            </Link>
          </div>

          {/* Owners */}
          <div className="bg-[#042644] text-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 flex flex-col justify-between gap-8">
            <div>
              <span className="bg-[#c9f13e] text-black px-3 py-1 rounded-full text-[12px] font-medium">
                For Turf Owners
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-normal text-white mt-4 tracking-tight">
                Fill courts, stop no-shows, track earnings.
              </h2>
              <ul className="flex flex-col gap-3 mt-6">
                {OWNER_PERKS.map((perk, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-white/80">
                    <span className="size-5 rounded-full bg-[#c9f13e] text-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/list-venue"
              className="group bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium inline-flex items-center justify-between w-fit mt-4"
            >
              <span>List your venue free</span>
              <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover:translate-x-0.5 ml-4">
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
