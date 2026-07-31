'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Tabs } from '@/components/ui/Tabs'
import { BookingCard } from '@/components/booking/BookingCard'
import { DEMO_USER_BOOKINGS } from '@/lib/demo-data'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
]

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')

  const bookings = DEMO_USER_BOOKINGS.filter((b) =>
    activeTab === 'upcoming' ? b.status === 'confirmed' : b.status !== 'confirmed'
  )

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl text-surface-900 mb-6">My Bookings</h1>

        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex flex-col gap-4 mt-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showCancel={activeTab === 'upcoming'} />
            ))
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-10 h-10 text-surface-800/30 mx-auto mb-3" />
              <p className="text-surface-800/60 mb-4">No bookings yet.</p>
              <Link href="/venues" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Browse Venues
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
