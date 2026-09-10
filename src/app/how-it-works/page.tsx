'use client'

import Link from 'next/link'
import { Search, CalendarCheck, CheckCircle, MapPinned, Clock3, ShieldCheck, Star, Wallet, LayoutDashboard, Users2, LineChart, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Find a Venue',
    description: 'Browse turfs by area, sport, or amenities. Check real-time slot availability before you commit to anything.',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Pick Your Slot',
    description: 'Choose your preferred date, time, and duration. Pricing is shown upfront — no surprises, no back-and-forth calls.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Book Instantly',
    description: 'Confirm your booking in seconds and get instant confirmation. Show up and play — that’s it.',
  },
]

const FOR_PLAYERS = [
  { icon: MapPinned, text: 'Browse by area, sport, or amenities' },
  { icon: Clock3, text: 'Check real-time availability — no more phone calls' },
  { icon: ShieldCheck, text: 'Book and pay securely — instant confirmation' },
  { icon: Star, text: 'Rate and review after your game' },
]

const FOR_OWNERS = [
  { icon: Wallet, text: 'List your venue for free in minutes' },
  { icon: LayoutDashboard, text: 'Manage slots and pricing from your dashboard' },
  { icon: Users2, text: 'Reach thousands of players in Surat' },
  { icon: LineChart, text: 'Track bookings and revenue in real-time' },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />
      <main className="text-surface-800">
        <section className="hero-glow py-20 md:py-28 text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-surface-900 text-balance">How CricBooking Works</h1>
            <p className="mt-4 text-surface-800/70 text-lg">
              From finding the perfect turf to playing your match — here&apos;s how simple it is.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <div className="flex flex-col gap-6">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 100}>
                <div className="glass-card rounded-2xl p-6 sm:p-8 flex items-start gap-6">
                  <div className="shrink-0 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className="font-display font-bold text-3xl text-surface-900/10">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-surface-900">{step.title}</h3>
                    <p className="text-surface-800/70 mt-2 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="bg-white/[0.02]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="font-display font-bold text-3xl text-surface-900 text-center mb-10">For Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FOR_PLAYERS.map((item, i) => (
                <ScrollReveal key={item.text} delay={i * 80}>
                  <div className="glass-card rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <p className="text-sm text-surface-800">{item.text}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="font-display font-bold text-3xl text-surface-900 text-center mb-10">For Venue Owners</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FOR_OWNERS.map((item, i) => (
                <ScrollReveal key={item.text} delay={i * 80}>
                  <div className="glass-card rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <p className="text-sm text-surface-800">{item.text}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-900">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/venues">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <span className="flex items-center gap-1.5 justify-center">Find Venues <ArrowRight className="w-4 h-4" /></span>
              </Button>
            </Link>
            <Link href="/list-venue">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-surface-300 text-surface-800 bg-transparent hover:bg-surface-100">
                List Your Venue
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
