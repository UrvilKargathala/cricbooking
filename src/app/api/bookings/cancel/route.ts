import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { booking_id } = await req.json()
  if (!booking_id) {
    return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: booking, error: fetchError } = await admin
    .from('bookings')
    .select('*, venue:venues(cancellation_hours, cancellation_refund_pct), slot:slots(*)')
    .eq('id', booking_id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.status !== 'confirmed') {
    return NextResponse.json({ error: 'Booking is not active' }, { status: 400 })
  }

  const cancelHours = booking.venue?.cancellation_hours ?? 0
  if (cancelHours > 0 && booking.slot) {
    const slotStart = new Date(`${booking.slot.date}T${booking.slot.start_time}`)
    const hoursUntilSlot = (slotStart.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntilSlot < cancelHours) {
      return NextResponse.json({
        error: `Cannot cancel within ${cancelHours} hours of the slot`,
      }, { status: 400 })
    }
  }

  const { error: updateError } = await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking_id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }

  if (booking.slot) {
    await admin.from('slots').update({ status: 'available' }).eq('id', booking.slot.id)
  }

  const refundPct = booking.venue?.cancellation_refund_pct ?? 100
  const paymentId = booking.notes?.match(/Razorpay: (pay_\w+)/)?.[1]
  let refundId: string | null = null

  if (paymentId && booking.amount > 0 && refundPct > 0) {
    const refundAmount = Math.round((booking.amount * refundPct) / 100 * 100)
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: refundAmount,
        notes: { booking_id, reason: 'User cancellation' },
      })
      refundId = refund.id
      await admin
        .from('bookings')
        .update({
          payment_status: refundPct === 100 ? 'refunded' : 'partial_refund',
          notes: `${booking.notes} | Refund: ${refund.id} (${refundPct}%)`,
        })
        .eq('id', booking_id)
    } catch {
      await admin
        .from('bookings')
        .update({ notes: `${booking.notes} | Refund failed` })
        .eq('id', booking_id)
    }
  }

  return NextResponse.json({
    success: true,
    refund_pct: refundPct,
    refund_id: refundId,
  })
}
