'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Tabs } from '@/components/ui/Tabs'
import { BookingCard } from '@/components/booking/BookingCard'
import { createClient } from '@/lib/supabase'
import { fetchUserBookings } from '@/lib/supabase-queries'
import type { Booking } from '@/types'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
]

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchBookings = async (uid: string) => {
    const data = await fetchUserBookings(uid)
    setAllBookings(data)
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        await fetchBookings(user.id)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel('user-bookings')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `user_id=eq.${userId}` },
        () => { fetchBookings(userId) }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const bookings = allBookings.filter((b) =>
    activeTab === 'upcoming' ? b.status === 'confirmed' : b.status !== 'confirmed'
  )

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl text-surface-900 mb-6">My Bookings</h1>

        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex flex-col gap-4 mt-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-surface-800/60 mt-3">Loading bookings...</p>
            </div>
          ) : bookings.length > 0 ? (
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
