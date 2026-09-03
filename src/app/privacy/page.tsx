'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display font-bold text-3xl text-surface-900">Privacy Policy</h1>
        <p className="text-sm text-surface-800/50 mt-2">Last updated: September 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm text-surface-800/80 leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">What we collect</h2>
            <p>
              To book a slot, we collect your name, email, and phone number, along with the bookings you make.
              Venue owners see only what they need to fulfil a booking — your name, contact number, and the
              slot details.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">How we use it</h2>
            <p>
              Your details are used to confirm bookings, send booking-related updates, and let you manage your
              bookings and reviews from your account. We don&apos;t sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">Payments</h2>
            <p>
              Payments are processed by Razorpay. CricBooking does not store your card, UPI, or bank details —
              they&apos;re handled directly by Razorpay&apos;s secure checkout.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">Your choices</h2>
            <p>
              You can update your profile details or delete your account at any time from your account
              settings. To request deletion of your booking history, email us and we&apos;ll process it.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-surface-900 mb-2">Contact</h2>
            <p>
              Privacy questions can be sent to{' '}
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
