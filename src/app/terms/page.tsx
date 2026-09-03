'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display font-bold text-3xl text-surface-900">Terms of Service</h1>
        <p className="text-sm text-surface-800/50 mt-2">Last updated: September 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm text-surface-800/80 leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">Using CricBooking</h2>
            <p>
              CricBooking lets you discover and book cricket turfs, box cricket arenas, and other sports venues
              across Surat. By booking a slot through the platform, you agree to arrive on time, follow each
              venue&apos;s on-site rules, and pay the listed price for your slot.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">Bookings &amp; Payments</h2>
            <p>
              Prices shown at checkout are set by the venue and include no additional CricBooking fee. A booking
              is confirmed once payment succeeds; slot availability updates in real time so a slot is held only
              once your booking is confirmed, not while you&apos;re browsing.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">Cancellations</h2>
            <p>
              Each venue sets its own cancellation window and refund percentage, shown on the venue page before
              you book. Cancelling outside that window may not be eligible for a refund.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">Venue Owners</h2>
            <p>
              Listing a venue is free. Owners are responsible for keeping slot availability, pricing, and venue
              details accurate, and for maintaining the venue in the condition described on its listing.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">Contact</h2>
            <p>
              Questions about these terms can be sent to{' '}
              <a href="mailto:hello@cricbooking.com" className="text-brand-600 hover:text-brand-700 font-medium">
                hello@cricbooking.com
              </a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
