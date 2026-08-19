'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'

function ConfirmedContent() {
  const searchParams = useSearchParams()
  const codes = searchParams.get('codes')?.split(',') ?? []

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>

      <h1 className="font-display font-bold text-2xl text-surface-900 mb-2">Booking Confirmed!</h1>
      <p className="text-surface-800/60 mb-6">
        Your payment was successful and your slot{codes.length > 1 ? 's have' : ' has'} been reserved.
      </p>

      {codes.length > 0 && (
        <div className="bg-surface-50 rounded-xl border border-surface-200 p-4 mb-6">
          <p className="text-sm text-surface-800/60 mb-2">Booking Code{codes.length > 1 ? 's' : ''}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {codes.map((code) => (
              <span key={code} className="font-mono font-semibold text-lg text-brand-700 bg-brand-50 px-3 py-1 rounded-lg">
                {code}
              </span>
            ))}
          </div>
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
          <Button variant="outline" className="flex items-center gap-2">
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
    <>
      <Header />
      <Suspense fallback={
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </main>
      }>
        <ConfirmedContent />
      </Suspense>
      <Footer />
    </>
  )
}
