'use client'

import { Globe, SlidersHorizontal, LineChart } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VenueForm } from '@/components/venue/VenueForm'
import type { VenueFormData } from '@/types'

const BENEFITS = [
  { icon: Globe, title: 'Online Bookings', description: 'Receive bookings 24/7 without phone calls or WhatsApp.' },
  { icon: SlidersHorizontal, title: 'Manage Slots', description: 'Control your availability, block slots, set pricing for day/night/weekend.' },
  { icon: LineChart, title: 'Track Revenue', description: 'See daily, weekly, monthly earnings with detailed reports.' },
]

export default function ListVenuePage() {
  const handleSubmit = (data: VenueFormData) => {
    alert('Thank you! Your venue "' + data.name + '" has been submitted for review. We will contact you within 24 hours.')
  }

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display font-bold text-3xl sm:text-4xl">List Your Venue on CricBooking</h1>
            <p className="mt-4 text-white/80">
              Reach thousands of cricket players in Surat. Manage bookings, track revenue, and grow your business.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl border border-surface-200 p-6 text-center">
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-display font-semibold text-surface-900">{benefit.title}</h3>
                <p className="text-sm text-surface-800/60 mt-1.5">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-display font-bold text-2xl text-surface-900">Register Your Venue</h2>
          <p className="text-sm text-surface-800/60 mt-1 mb-8">
            Fill in your venue details. Our team will review and approve your listing within 24 hours.
          </p>

          <VenueForm onSubmit={handleSubmit} />
        </section>
      </main>
      <Footer />
    </>
  )
}
