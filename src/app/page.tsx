'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Calendar,
  Shield,
  Zap,
  IndianRupee,
  ShieldCheck,
  Clock,
  Star,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Headphones,
  RotateCcw,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { VenueCard } from '@/components/venue/VenueCard'
import { fetchAreas, fetchVenues, fetchBookingCount, fetchTodaySlotCounts, type VenueSlotInfo } from '@/lib/supabase-queries'
import type { Area, Venue } from '@/types'

const HOW_IT_WORKS = [
  { icon: MapPin, title: 'Find a Venue', description: 'Browse turfs by area, sport, or amenities. Check real-time slot availability.' },
  { icon: Calendar, title: 'Pick Your Slot', description: 'Choose your preferred date, time, and duration. See pricing upfront.' },
  { icon: Shield, title: 'Book Instantly', description: 'Confirm your booking in seconds. No calls needed, no hidden charges.' },
]

const TRUST_BAR = [
  { icon: Zap, label: 'Instant Confirmation' },
  { icon: IndianRupee, label: 'No Hidden Fees' },
  { icon: ShieldCheck, label: 'Verified Venues' },
  { icon: Clock, label: '24/7 Booking' },
]

const WHY_CRICBOOKING = [
  { icon: ShieldCheck, title: 'Verified Venues', description: 'Every venue is personally verified for quality, safety, and amenities.' },
  { icon: Zap, title: 'Instant Confirmation', description: 'Get booking confirmation immediately. No waiting, no callbacks.' },
  { icon: IndianRupee, title: 'No Hidden Fees', description: 'What you see is what you pay. Transparent pricing always.' },
  { icon: Clock, title: 'Real-Time Availability', description: 'Live slot updates so you never show up to a booked ground.' },
  { icon: Headphones, title: '24/7 Booking', description: 'Book anytime, anywhere. Our platform never sleeps.' },
  { icon: RotateCcw, title: 'Easy Cancellation', description: 'Plans changed? Cancel hassle-free as per venue policy.' },
]

const TESTIMONIALS = [
  {
    id: 't1', name: 'Rohan Patel', area: 'Vesu', rating: 5,
    comment: 'Booked a slot in under a minute. No more calling five different turfs to check availability — this just works.',
    venue_name: 'Surat Cricket Arena',
  },
  {
    id: 't2', name: 'Priya Trivedi', area: 'Adajan', rating: 5,
    comment: 'Our office group plays every Sunday now. The slot picker makes it so easy to see what is free before we commit.',
    venue_name: 'Champion Turf Ground',
  },
  {
    id: 't3', name: 'Kunal Shah', area: 'Varachha', rating: 4,
    comment: 'Good variety of grounds near Varachha. Prices are clearly listed upfront, no surprises when we show up.',
    venue_name: 'Green Pitch Sports',
  },
]


const FAQS = [
  {
    question: 'How do I book a venue on CricBooking?',
    answer: 'Simply search for venues by area or sport, pick an available slot, and confirm your booking. You’ll receive instant confirmation.',
  },
  {
    question: 'Is there a booking fee?',
    answer: 'CricBooking charges no extra booking fee. You pay only the venue’s listed price.',
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, cancellations are allowed as per each venue’s cancellation policy. Check the venue details page for specific terms.',
  },
  {
    question: 'How do I know if a venue is good?',
    answer: 'All venues on CricBooking are personally verified. You can also check ratings and reviews from other players.',
  },
  {
    question: 'What sports can I book venues for?',
    answer: 'Currently you can book for Box Cricket and Cricket Ground sessions across Surat.',
  },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [areas, setAreas] = useState<Area[]>([])
  const [allVenues, setAllVenues] = useState<Venue[]>([])
  const [bookingCount, setBookingCount] = useState(0)
  const [statsLoaded, setStatsLoaded] = useState(false)
  const [statsError, setStatsError] = useState(false)
  const [slotCounts, setSlotCounts] = useState<Record<string, VenueSlotInfo>>({})

  useEffect(() => {
    Promise.all([
      fetchAreas().then(setAreas),
      fetchVenues().then(setAllVenues),
      fetchBookingCount().then(setBookingCount),
      fetchTodaySlotCounts().then(setSlotCounts),
    ]).catch(() => setStatsError(true)).finally(() => setStatsLoaded(true))
  }, [])

  const popularVenues = allVenues.slice(0, 6)

  const venueNames = allVenues.map((v) => v.name)

  const areaVenueCounts = areas.map((area) => ({
    ...area,
    count: allVenues.filter((v) => v.area?.slug === area.slug).length,
  })).filter((area) => area.count > 0)

  return (
    <div className="bg-surface-50">
      <Header />
      <main className="text-surface-800">
        {/* Hero */}
        <section className="relative -mt-16 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=1600&q=80"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/70 to-surface-900/40" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 animate-fade-up">
              <Sparkles className="w-3.5 h-3.5" />
              Trusted by 500+ players in Surat
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-6xl text-white mt-4 max-w-2xl animate-fade-up [animation-delay:80ms] text-balance">
              Book turfs.<br /><span className="font-black">Play more cricket.</span>
            </h1>
            <p className="mt-4 text-white/70 text-base sm:text-lg max-w-lg animate-fade-up [animation-delay:160ms]">
              Find real-time slots, compare venues, and book instantly. No hidden fees, no phone calls.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6 animate-fade-up [animation-delay:240ms]">
              <Link href="/venues">
                <Button variant="primary" size="lg">
                  <span className="flex items-center gap-1.5">
                    Search Venues <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="border-white/30 text-white bg-white/5 hover:bg-white/15">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Live stats strip */}
          {statsLoaded && !statsError && (
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-14 pb-8 animate-fade-up [animation-delay:320ms]">
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                {[
                  { value: allVenues.length, label: 'Venues' },
                  { value: Object.values(slotCounts).reduce((sum, v) => sum + v.available, 0), label: 'Slots Available Today' },
                  { value: bookingCount, label: 'Bookings & Counting' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <span className="font-display font-bold text-2xl sm:text-3xl text-white">{stat.value.toLocaleString('en-IN')}+</span>
                    <span className="text-white/60 text-xs sm:text-sm font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Trust strip — real venues on the platform */}
        {venueNames.length > 0 && (
          <div className="border-b border-surface-200 py-6 bg-white">
            <p className="text-center text-xs font-medium text-surface-800/40 uppercase tracking-wider mb-4">
              Venues booking on CricBooking
            </p>
            <div className="marquee-mask overflow-hidden">
              <div className="testimonial-track flex items-center gap-10 w-max">
                {[...venueNames, ...venueNames].map((name, i) => (
                  <span key={`${name}-${i}`} className="font-display font-semibold text-lg text-surface-800/30 whitespace-nowrap">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats + trust bar */}
        <section className="relative z-10 py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="glass-card rounded-2xl px-6 py-8 sm:px-10 sm:py-10">
              {statsError ? (
                <p className="text-sm text-surface-800/50 text-center py-4">Could not load stats right now. Please refresh the page.</p>
              ) : (
                <div className="grid grid-cols-3 gap-4 sm:gap-8">
                  <div className="text-center">
                    <p className="font-display font-bold text-3xl sm:text-4xl text-brand-600">
                      {statsLoaded ? <CountUp value={allVenues.length} suffix="+" /> : <span className="opacity-0">0</span>}
                    </p>
                    <p className="text-xs sm:text-sm text-surface-800/50 mt-1">Verified Venues</p>
                  </div>
                  <div className="text-center border-x border-surface-200">
                    <p className="font-display font-bold text-3xl sm:text-4xl text-brand-600">
                      {statsLoaded ? <CountUp value={areas.length} /> : <span className="opacity-0">0</span>}
                    </p>
                    <p className="text-xs sm:text-sm text-surface-800/50 mt-1">Areas in Surat</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-3xl sm:text-4xl text-brand-600">
                      {statsLoaded ? <CountUp value={bookingCount} suffix="+" /> : <span className="opacity-0">0</span>}
                    </p>
                    <p className="text-xs sm:text-sm text-surface-800/50 mt-1">Bookings Made</p>
                  </div>
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-surface-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRUST_BAR.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 justify-center bg-surface-100 rounded-lg py-2.5 px-3">
                    <item.icon className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-surface-800/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16 scroll-mt-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-900 text-center">How It Works</h2>
          <p className="text-surface-800/50 text-center mt-3 mb-14 text-lg">Book your next match in three simple steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px border-t-2 border-dashed border-brand-400/20" />
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 100}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-brand-500/20">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold tracking-widest text-brand-600 uppercase mb-1.5">Step {i + 1}</span>
                  <h3 className="font-display font-semibold text-lg text-surface-900">{step.title}</h3>
                  <p className="text-sm text-surface-800/50 mt-1.5 max-w-[240px]">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Popular Venues */}
        {popularVenues.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-900">Popular Venues</h2>
                <p className="text-surface-800/50 mt-2 text-lg">Top-rated turfs loved by players across Surat</p>
              </div>
              <Link href="/venues" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0">
                View All Venues <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularVenues.map((venue, index) => (
                <ScrollReveal key={venue.id} delay={(index % 3) * 100}>
                  <VenueCard venue={venue} slotInfo={slotCounts[venue.id]} />
                </ScrollReveal>
              ))}
            </div>
            <Link href="/venues" className="sm:hidden mt-8 flex items-center justify-center gap-1 text-sm font-medium text-brand-600">
              View All Venues <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* Why CricBooking */}
        <section className="bg-white/[0.02] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-900 text-center">Why Players Choose CricBooking</h2>
            <p className="text-surface-800/50 text-center mt-3 mb-14 text-lg">Everything you need, nothing you don&apos;t</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHY_CRICBOOKING.map((feature, index) => (
                <ScrollReveal key={feature.title} delay={(index % 3) * 100}>
                  <div className="glass-card rounded-xl p-6 h-full hover:border-brand-400/30 transition-colors duration-300">
                    <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="font-display font-semibold text-surface-900">{feature.title}</h3>
                    <p className="text-sm text-surface-800/50 mt-1.5 leading-relaxed">{feature.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Areas We Cover */}
        {areaVenueCounts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-900 text-center">Explore Venues by Area</h2>
            <p className="text-surface-800/50 text-center mt-3 mb-10 text-lg">Find grounds close to you, anywhere in Surat</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {areaVenueCounts.map((area, index) => (
                <ScrollReveal key={area.slug} delay={(index % 4) * 100}>
                  <Link
                    href={`/venues?area=${area.slug}`}
                    className="group block glass-card rounded-xl hover:border-brand-300 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {area.image ? (
                        <Image src={area.image} alt={area.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 1024px) 50vw, 25vw" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-100 via-brand-200 to-brand-400 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-white/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-display font-semibold text-white text-sm drop-shadow-sm">{area.name}</h3>
                        <span className="text-xs text-white/80">{area.count} venue{area.count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="bg-white/[0.02] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-900 text-center">What Players Say</h2>
            <p className="text-surface-800/50 text-center mt-3 mb-12 text-lg">Hear from the Surat cricket community</p>
            <div className="marquee-mask -mx-4 sm:-mx-6 overflow-hidden">
              <div className="testimonial-track flex gap-6 px-4 sm:px-6 w-max">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
                  <div key={`${testimonial.id}-${index}`} className="glass-card rounded-xl p-5 w-[320px] shrink-0">
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-surface-800 leading-relaxed italic">&ldquo;{testimonial.comment}&rdquo;</p>
                    <div className="mt-4 pt-3 border-t border-surface-200">
                      <p className="text-sm font-medium text-surface-900">{testimonial.name}</p>
                      <p className="text-xs text-surface-800/50">{testimonial.area} · {testimonial.venue_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Owner CTA */}
        <section className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">Own a Sports Venue?</h2>
              <p className="text-white/80 mt-1.5 max-w-lg">
                List your ground on CricBooking and reach thousands of players in Surat. Free to list, easy to manage.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/list-venue">
                <Button variant="secondary" size="lg">
                  List Your Venue
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="border-white/40 text-white bg-transparent hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div key={faq.question} className="glass-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-medium text-sm text-surface-900">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-surface-800/50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm text-surface-800/70 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-surface-900">Ready to Play?</h2>
          <p className="text-surface-800/50 mt-3 text-lg max-w-lg mx-auto">
            Join thousands of players booking their next match on CricBooking.
          </p>
          <Link href="/venues" className="inline-block mt-8">
            <Button variant="primary" size="lg">
              <span className="flex items-center gap-1.5">
                Find Venues Near You
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
