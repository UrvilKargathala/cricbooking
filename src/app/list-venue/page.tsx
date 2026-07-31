'use client'

import { useState } from 'react'
import { Globe, SlidersHorizontal, LineChart } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DEMO_AREAS } from '@/lib/demo-data'

const BENEFITS = [
  { icon: Globe, title: 'Online Bookings', description: 'Receive bookings 24/7 without phone calls or WhatsApp.' },
  { icon: SlidersHorizontal, title: 'Manage Slots', description: 'Control your availability, block slots, set pricing for day/night/weekend.' },
  { icon: LineChart, title: 'Track Revenue', description: 'See daily, weekly, monthly earnings with detailed reports.' },
]

const VENUE_TYPES = ['Box Cricket', 'Cricket Ground', 'Multi-Sport']

export default function ListVenuePage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Thank you! We'll review your venue and contact you within 24 hours.")
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

        <section className="max-w-xl mx-auto px-4 sm:px-6 pb-16">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-surface-200 p-6 flex flex-col gap-4">
            <h2 className="font-display font-semibold text-lg text-surface-900">Venue Registration</h2>

            <Input label="Venue Name" placeholder="e.g. Surat Cricket Arena" required />
            <Input label="Owner Name" placeholder="Your full name" required />

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-surface-100 border border-surface-200 rounded-lg text-sm text-surface-800">
                  +91
                </span>
                <Input type="tel" placeholder="98765 43210" maxLength={10} className="flex-1" required />
              </div>
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-surface-800 mb-1.5">Area</label>
              <select
                id="area"
                required
                defaultValue=""
                className="w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="" disabled>Select an area</option>
                {DEMO_AREAS.map((area) => (
                  <option key={area.slug} value={area.slug}>{area.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Venue Type</label>
              <div className="flex flex-col gap-2">
                {VENUE_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-surface-800">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className="w-4 h-4 accent-brand-600"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" className="mt-2">Submit for Review</Button>

            <p className="text-xs text-surface-800/50 text-center">
              After approval, you&apos;ll get access to the Owner Dashboard to manage your venue.
            </p>
          </form>
        </section>
      </main>
      <Footer />
    </>
  )
}
