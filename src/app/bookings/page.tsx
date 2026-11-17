'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BookingCard } from '@/components/booking/BookingCard'
import { createClient } from '@/lib/supabase'
import { fetchUserBookings } from '@/lib/supabase-queries'
import { useToastStore } from '@/store/useToastStore'
import type { Booking } from '@/types'

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const showToast = useToastStore((s) => s.showToast)

  const handleCancel = async (booking: Booking) => {
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to cancel booking', 'error')
        return
      }
      showToast('Booking cancelled successfully', 'success')
      if (userId) fetchBookings(userId)
    } catch {
      showToast('Failed to cancel booking', 'error')
    }
  }

  const fetchBookings = async (uid: string) => {
    try {
      const data = await fetchUserBookings(uid)
      setAllBookings(data || [])
    } catch {
      setAllBookings([])
    }
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || 'Player')
        await fetchBookings(user.id)
      } else {
        router.push('/login?redirect=/bookings')
        return
      }
      setLoading(false)
    }
    load()
  }, [router])

  const upcomingBookings = allBookings.filter((b) => b.status === 'confirmed')
  const pastBookings = allBookings.filter((b) => b.status !== 'confirmed')
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'TD'

  if (loading) {
    return (
      <div className="bg-white min-h-screen text-black font-['Geist'] flex flex-col justify-between">
        <Header />
        <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-8 bg-[#f4f6f8] rounded-full w-48 mx-auto" />
            <div className="h-4 bg-[#f4f6f8] rounded-full w-32 mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Profile Card Header */}
        <div className="bg-[#f4f6f8] rounded-[24px] sm:rounded-[32px] p-6 sm:p-9 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="size-14 sm:size-16 rounded-full bg-[#c9f13e] text-black font-semibold text-lg sm:text-xl flex items-center justify-center border-2 border-white shadow-sm">
              {initials}
            </span>
            <div>
              <h1 className="text-[26px] sm:text-[30px] font-medium tracking-tight text-black">
                Hi, {userEmail ? userEmail.split('@')[0] : 'Player'}
              </h1>
              <p className="text-[14px] text-[#50555c]">Member since 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="bg-white px-5 py-3 rounded-2xl flex flex-col shadow-sm flex-1 sm:flex-initial">
              <span className="text-[11px] text-[#6c6c6c] uppercase tracking-wider font-medium">
                Total Bookings
              </span>
              <span className="text-[22px] font-semibold text-black">
                {allBookings.length}
              </span>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl flex flex-col shadow-sm flex-1 sm:flex-initial">
              <span className="text-[11px] text-[#6c6c6c] uppercase tracking-wider font-medium">
                Hours Played
              </span>
              <span className="text-[22px] font-semibold text-[#1849c9]">
                {allBookings.length} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-black text-white'
                : 'bg-[#f4f6f8] text-black hover:bg-[#eef1f4]'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-black text-white'
                : 'bg-[#f4f6f8] text-black hover:bg-[#eef1f4]'
            }`}
          >
            Past & Cancelled ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {displayedBookings.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {displayedBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                showCancel={activeTab === 'upcoming'}
                onCancel={() => handleCancel(b)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#f4f6f8] rounded-[24px] p-8 flex flex-col items-center justify-center">
            <p className="text-[20px] font-medium text-black">No {activeTab} bookings</p>
            <p className="text-[14px] text-[#50555c] mt-1 max-w-sm">
              {activeTab === 'upcoming'
                ? 'You have no matches scheduled right now. Ready to play?'
                : 'No past booking history found.'}
            </p>
            <Link
              href="/venues"
              className="group mt-6 bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-5 pr-2 py-2.5 rounded-full text-[14px] font-medium inline-flex items-center gap-2.5"
            >
              <span>Book a turf</span>
              <span className="size-7 rounded-full bg-black text-[#c9f13e] flex items-center justify-center">
                <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
              </span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
