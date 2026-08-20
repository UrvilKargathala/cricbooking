'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Clock, MapPin, CreditCard,
  CheckCircle2, XCircle, AlertCircle, Star, RefreshCw, RotateCcw,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase'
import { useToastStore } from '@/store/useToastStore'
import { formatPrice, formatTime } from '@/lib/utils'
import type { Booking, Review } from '@/types'

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  confirmed: { icon: CheckCircle2, color: 'text-emerald-600', label: 'Confirmed' },
  completed: { icon: CheckCircle2, color: 'text-blue-600', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600', label: 'Cancelled' },
  no_show: { icon: AlertCircle, color: 'text-amber-600', label: 'No Show' },
}

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const showToast = useToastStore((s) => s.showToast)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    const load = async () => {
      const { id } = params
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/bookings'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('bookings')
        .select('*, venue:venues(*, area:areas(*)), court:courts(*), slot:slots(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!data) { router.push('/bookings'); return }
      setBooking({
        ...data,
        amount: Number(data.amount) || 0,
      } as Booking)

      const { data: review } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('venue_id', data.venue_id)
        .maybeSingle()
      if (review) setExistingReview(review)

      setLoading(false)
    }
    load()
  }, [params.id, router])

  const canCancelBooking = () => {
    if (!booking?.slot || !booking.venue) return true
    const cancelHours = booking.venue.cancellation_hours ?? 0
    if (cancelHours === 0) return true
    const slotStart = new Date(`${booking.slot.date}T${booking.slot.start_time}`)
    const hoursUntilSlot = (slotStart.getTime() - Date.now()) / (1000 * 60 * 60)
    return hoursUntilSlot >= cancelHours
  }

  const handleCancel = async () => {
    if (!booking) return
    if (!canCancelBooking()) {
      showToast(`Cannot cancel within ${booking.venue?.cancellation_hours} hours of the slot`, 'error')
      return
    }
    setCancelling(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)
    if (error) {
      showToast('Failed to cancel booking', 'error')
      setCancelling(false)
      return
    }
    if (booking.slot) {
      await supabase.from('slots').update({ status: 'available' }).eq('id', booking.slot.id)
    }
    setBooking({ ...booking, status: 'cancelled' })
    setCancelOpen(false)
    setCancelling(false)
    showToast('Booking cancelled', 'success')
  }

  const handleReview = async () => {
    if (!booking || !userId) return
    setSubmittingReview(true)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').insert({
      user_id: userId,
      venue_id: booking.venue_id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    })
    setSubmittingReview(false)
    if (error) {
      showToast(error.code === '23505' ? 'You already reviewed this venue' : 'Failed to submit review', 'error')
    } else {
      showToast('Review submitted!', 'success')
      setReviewOpen(false)
      setExistingReview({ id: '', user_id: userId, venue_id: booking.venue_id, rating: reviewRating, comment: reviewComment.trim() || null, created_at: new Date().toISOString() })
    }
  }

  const statusCfg = booking ? STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed : STATUS_CONFIG.confirmed
  const StatusIcon = statusCfg.icon

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/bookings" className="inline-flex items-center gap-1.5 text-sm text-surface-800/60 hover:text-surface-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </Link>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-surface-800/60 mt-3">Loading booking...</p>
          </div>
        ) : booking ? (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="flex items-center gap-3 bg-white rounded-xl border border-surface-200 p-5">
              <StatusIcon className={`w-8 h-8 ${statusCfg.color}`} />
              <div>
                <p className={`font-display font-semibold text-lg ${statusCfg.color}`}>{statusCfg.label}</p>
                <p className="text-sm text-surface-800/50">
                  Booked on {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className="ml-auto font-mono text-sm text-surface-800/70 bg-surface-100 px-3 py-1 rounded-lg">
                {booking.booking_code}
              </span>
            </div>

            {/* Receipt Card */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="p-5 border-b border-surface-200">
                <h2 className="font-display font-semibold text-surface-900 text-lg">Booking Receipt</h2>
              </div>

              <div className="p-5 space-y-4">
                {/* Venue */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                  <div>
                    <Link href={`/venues/${booking.venue?.slug}`} className="font-display font-semibold text-surface-900 hover:text-brand-700">
                      {booking.venue?.name}
                    </Link>
                    <p className="text-sm text-surface-800/60">{booking.venue?.address}</p>
                    {booking.venue?.area && (
                      <p className="text-sm text-surface-800/50">{booking.venue.area.name}, Surat</p>
                    )}
                  </div>
                </div>

                {/* Court */}
                {booking.court && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                    </div>
                    <p className="text-sm text-surface-800">
                      <span className="font-medium">{booking.court.name}</span>
                    </p>
                  </div>
                )}

                {/* Date & Time */}
                {booking.slot && (
                  <>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-surface-800/40 shrink-0" />
                      <p className="text-sm text-surface-800">
                        {new Date(booking.slot.date + 'T00:00:00').toLocaleDateString('en-IN', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-surface-800/40 shrink-0" />
                      <p className="text-sm text-surface-800">
                        {formatTime(booking.slot.start_time)} &mdash; {formatTime(booking.slot.end_time)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Amount */}
              <div className="bg-surface-50 px-5 py-4 flex items-center justify-between border-t border-surface-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-surface-800/40" />
                  <span className="text-sm text-surface-800/70">Amount Paid</span>
                </div>
                <span className="font-display font-bold text-lg text-surface-900">{formatPrice(booking.amount)}</span>
              </div>

              <div className="px-5 py-3 border-t border-surface-200 flex items-center justify-between text-xs text-surface-800/40">
                <span>Payment: <Badge variant={booking.payment_status as 'confirmed'}>{booking.payment_status}</Badge></span>
                <span>Source: {booking.source}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {booking.status === 'confirmed' && (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={async () => {
                      if (!confirm('This will cancel your current booking and take you to the venue page to book a new slot. Continue?')) return
                      await handleCancel()
                      router.push(`/venues/${booking.venue?.slug}`)
                    }}
                  >
                    <RefreshCw className="w-4 h-4" /> Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel Booking
                  </Button>
                </>
              )}
              {(booking.status === 'completed' || booking.status === 'cancelled') && booking.venue?.slug && (
                <Link href={`/venues/${booking.venue.slug}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Book Again
                  </Button>
                </Link>
              )}
              {(booking.status === 'completed' || booking.status === 'confirmed') && !existingReview && (
                <Button variant="outline" onClick={() => setReviewOpen(true)} className="flex items-center gap-2">
                  <Star className="w-4 h-4" /> Write a Review
                </Button>
              )}
              {existingReview && (
                <div className="flex items-center gap-2 text-sm text-surface-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  You rated this venue {existingReview.rating}/5
                </div>
              )}
              <Link href={`/venues/${booking.venue?.slug}`}>
                <Button variant="outline">View Venue</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />

      {/* Cancel Confirmation */}
      <Modal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Booking">
        {!canCancelBooking() && booking?.venue && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
            Cancellation is not allowed within {booking.venue.cancellation_hours} hours of the slot start time.
          </div>
        )}
        <p className="text-sm text-surface-800/70 mb-4">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        {booking?.venue && (
          <div className="bg-surface-50 rounded-lg p-3 mb-4 text-sm">
            <p className="font-medium text-surface-900">{booking.venue.name}</p>
            {booking.slot && (
              <p className="text-surface-800/60">
                {new Date(booking.slot.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} &middot; {formatTime(booking.slot.start_time)}
              </p>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCancelOpen(false)} className="flex-1">Keep Booking</Button>
          <Button
            variant="primary"
            onClick={handleCancel}
            disabled={cancelling || !canCancelBooking()}
            className="flex-1 !bg-red-600 hover:!bg-red-700"
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="Write a Review">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-surface-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Comment (optional)</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm placeholder:text-surface-800/40 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
              placeholder="How was your experience at this venue?"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleReview}
            disabled={submittingReview}
            className="w-full"
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
