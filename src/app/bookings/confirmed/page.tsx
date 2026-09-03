'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { BookingTicket } from '@/components/booking/BookingTicket'
import { fetchBookingsByCodes } from '@/lib/supabase-queries'
import type { Booking } from '@/types'

function ConfirmedContent() {
  const searchParams = useSearchParams()
  const codes = searchParams.get('codes')?.split(',') ?? []
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (codes.length === 0) { setLoading(false); return }
    fetchBookingsByCodes(codes).then(setBookings).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <div className="check-circle-in w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-draw text-emerald-600"
            />
          </svg>
        </div>

        <h1 className="font-display font-bold text-2xl text-surface-900 mb-2">Booking Confirmed!</h1>
        <p className="text-surface-800/70">
          Your payment was successful and your slot{codes.length > 1 ? 's have' : ' has'} been reserved.
        </p>
      </div>

      {!loading && bookings.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          {bookings.map((booking, index) => (
            <BookingTicket key={booking.id} booking={booking} delayMs={300 + index * 120} />
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/bookings">
          <Button variant="primary" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            My Bookings
          </Button>
        </Link>
        <Link href="/venues">
          <Button variant="outline" className="flex items-center gap-2 border-surface-300 text-surface-800 bg-transparent hover:bg-surface-100">
            Book Another
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </main>
  )
}

export default function BookingConfirmedPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />
      <Suspense fallback={
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </main>
      }>
        <ConfirmedContent />
      </Suspense>
      <Footer />
    </div>
  )
}
