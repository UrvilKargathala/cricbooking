'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  MapPin,
  Calendar,
  CalendarCheck,
  Building2,
  Shield,
  Zap,
  IndianRupee,
  ShieldCheck,
  Clock,
  Star,
  ChevronDown,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { AreaSelector } from '@/components/venue/AreaSelector'
import { VenueCard } from '@/components/venue/VenueCard'
import { DEMO_AREAS, DEMO_VENUES, DEMO_TESTIMONIALS } from '@/lib/demo-data'
import { SPORT_LABELS } from '@/lib/utils'
import type { SportType } from '@/types'

const SPORT_OPTIONS = Object.entries(SPORT_LABELS) as [SportType, string][]

const HOW_IT_WORKS = [
  { icon: MapPin, title: 'Pick Your Area', description: 'Browse turfs and grounds near you, anywhere in Surat.' },
  { icon: Calendar, title: 'Choose a Slot', description: 'See real-time availability and pick a time that works.' },
  { icon: Shield, title: 'Book Instantly', description: 'Confirm your slot in seconds — no calls, no waiting.' },
]

const TRUST_BAR = [
  { icon: Zap, label: 'Instant Confirmation' },
  { icon: IndianRupee, label: 'No Hidden Fees' },
  { icon: ShieldCheck, label: 'Verified Venues' },
  { icon: Clock, label: '24/7 Booking' },
]

const FAQS = [
  {
    question: 'How do I book a slot?',
    answer: 'Pick a venue, choose a court and date, select an open slot, and confirm — your booking is instant, no calls needed.',
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes. Each venue sets its own cancellation window and refund percentage — you can see both on the venue page before you book.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'UPI, debit/credit cards, and net banking are all supported at checkout once payments go live.',
  },
  {
    question: 'Can multiple people book the same slot?',
    answer: 'No — once a slot is booked it is immediately marked unavailable to everyone else, so there is no double-booking.',
  },
]

export default function Home() {
  const router = useRouter()
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [heroArea, setHeroArea] = useState('')
  const [heroSport, setHeroSport] = useState('')

  const handleHeroSearch = () => {
    const params = new URLSearchParams()
    if (heroArea) params.set('area', heroArea)
    if (heroSport) params.set('sport', heroSport)
    router.push(`/venues${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const filteredVenues = selectedArea
    ? DEMO_VENUES.filter((v) => v.area?.slug === selectedArea)
    : DEMO_VENUES

  const areaVenueCounts = DEMO_AREAS.map((area) => ({
    ...area,
    count: DEMO_VENUES.filter((v) => v.area?.slug === area.slug).length,
  })).filter((area) => area.count > 0)

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden -mt-16">
          <img
            src="https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=1600"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/70 to-surface-900/40" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-36 sm:pt-44 pb-16 text-center">
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-white animate-fade-up">
              Book Cricket Turfs <span className="text-brand-400">Across Surat</span>
            </h1>
            <p className="mt-4 text-surface-200/80 text-base sm:text-lg max-w-xl mx-auto animate-fade-up [animation-delay:120ms]">
              Find and book box cricket, turfs, and grounds near you — real-time slots, instant confirmation.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 animate-fade-up [animation-delay:240ms]">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
              <div>
                <label className="block text-xs font-medium text-surface-800/60 mb-1">Area</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
                  <select
                    value={heroArea}
                    onChange={(e) => setHeroArea(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none"
                  >
                    <option value="">Any area</option>
                    {DEMO_AREAS.map((area) => (
                      <option key={area.slug} value={area.slug}>{area.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-800/60 mb-1">Sport</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
                  <select
                    value={heroSport}
                    onChange={(e) => setHeroSport(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none"
                  >
                    <option value="">Any sport</option>
                    {SPORT_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40 pointer-events-none" />
                </div>
              </div>

              <Button variant="primary" size="lg" onClick={handleHeroSearch} className="w-full sm:w-auto">
                Search
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-surface-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col items-center gap-8">
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-surface-900">
                    <CountUp value={DEMO_VENUES.length} suffix="+" />
                  </p>
                  <p className="text-sm text-surface-800/50">Venues</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-surface-900">
                    <CountUp value={DEMO_AREAS.length} />
                  </p>
                  <p className="text-sm text-surface-800/50">Areas</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-surface-900">
                    <CountUp value={1000} suffix="+" />
                  </p>
                  <p className="text-sm text-surface-800/50">Bookings</p>
                </div>
              </div>
            </div>

            <div className="w-full pt-6 border-t border-surface-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {TRUST_BAR.map((item) => (
                <div key={item.label} className="flex items-center gap-2 justify-center sm:justify-start">
                  <item.icon className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="text-sm text-surface-800/70">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-16">
          <h2 className="font-display font-bold text-xl text-surface-900 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.title} className="bg-white rounded-xl border border-surface-200 p-6 text-center">
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-display font-semibold text-surface-900">{step.title}</h3>
                <p className="text-sm text-surface-800/60 mt-1.5">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="font-display font-bold text-xl text-surface-900 text-center mb-10">Popular Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {areaVenueCounts.map((area, index) => (
              <ScrollReveal key={area.slug} delay={(index % 3) * 100}>
                <Link
                  href={`/venues?area=${area.slug}`}
                  className="group block bg-white rounded-xl border border-surface-200 hover:shadow-lg hover:border-brand-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-[16/10]">
                    {area.image ? (
                      <img src={area.image} alt={area.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-600 flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-white/80" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <h3 className="font-display font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
                      {area.name}
                    </h3>
                    <span className="text-sm text-surface-800/50">
                      {area.count} venue{area.count > 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-surface-900">Venues Near You</h2>
            <Link href="/venues" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>

          <div className="mb-6">
            <AreaSelector areas={DEMO_AREAS} selectedArea={selectedArea} onChange={setSelectedArea} />
          </div>

          {filteredVenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue, index) => (
                <ScrollReveal key={venue.id} delay={(index % 3) * 100}>
                  <VenueCard venue={venue} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <MapPin className="w-10 h-10 text-surface-800/30 mx-auto mb-3" />
              <p className="text-surface-800/60">No venues found in this area yet.</p>
            </div>
          )}
        </section>

        <section className="bg-surface-100/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display font-bold text-xl text-surface-900 text-center mb-10">
              What Players Are Saying
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {DEMO_TESTIMONIALS.map((testimonial, index) => (
                <ScrollReveal key={testimonial.id} delay={(index % 3) * 100}>
                  <div className="bg-white rounded-xl border border-surface-200 p-5">
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-surface-800/80 leading-relaxed">&ldquo;{testimonial.comment}&rdquo;</p>
                    <div className="mt-4 pt-3 border-t border-surface-200">
                      <p className="text-sm font-medium text-surface-900">{testimonial.name}</p>
                      <p className="text-xs text-surface-800/50">{testimonial.area} · {testimonial.venue_name}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="font-display font-bold text-xl text-surface-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div key={faq.question} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-medium text-sm text-surface-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-surface-800/50 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm text-surface-800/70 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-brand-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h2 className="font-display font-bold text-2xl text-white">Own a Turf or Cricket Ground?</h2>
              <p className="text-white/80 mt-1">List your venue on CricBooking and reach thousands of players in Surat.</p>
            </div>
            <Link href="/list-venue">
              <Button variant="secondary" size="lg">List Your Venue</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
