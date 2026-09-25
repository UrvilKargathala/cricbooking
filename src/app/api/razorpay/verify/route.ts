import { NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { checkPaidOrder } from '@/lib/paymentCheck'
import { getAuthedUser, createServiceRoleClient } from '@/lib/supabase-server'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'CB-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: Request) {
  const user = await getAuthedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    slot_ids,
    venue_id,
    court_id,
  } = await req.json()

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !slot_ids?.length || !venue_id || !court_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  // The same payment must never create bookings twice (e.g. after a cancelled + refunded booking)
  const { data: existing } = await admin
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .like('notes', `Razorpay: ${razorpay_payment_id}%`)
  if (existing?.length) {
    const active = existing.filter((b) => b.status === 'confirmed')
    if (active.length === 0) {
      return NextResponse.json({ error: 'This payment has already been used' }, { status: 409 })
    }
    return NextResponse.json({ success: true, bookings: active })
  }

  // The signature only proves *a* payment happened. Confirm with Razorpay that the order was
  // fully paid and was created for exactly this user, court and slots.
  let order
  try {
    order = await razorpay.orders.fetch(razorpay_order_id)
  } catch {
    return NextResponse.json({ error: 'Payment order not found' }, { status: 400 })
  }
  const problem = checkPaidOrder({
    order,
    userId: user.id,
    venueId: venue_id,
    courtId: court_id,
    slotIds: slot_ids,
  })
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 })
  }

  // What was actually paid, per slot
  const perSlotAmount = Number(order.amount) / 100 / slot_ids.length

  const bookings = []
  const bookedSlotIds: string[] = []

  for (const slotId of slot_ids) {
    const { data: updated, error: slotError } = await admin
      .from('slots')
      .update({ status: 'booked' })
      .eq('id', slotId)
      .eq('status', 'available')
      .select('id')

    if (slotError || !updated?.length) continue
    bookedSlotIds.push(slotId)

    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .insert({
        booking_code: generateBookingCode(),
        user_id: user.id,
        booked_by: user.id,
        venue_id,
        court_id,
        slot_id: slotId,
        amount: perSlotAmount,
        status: 'confirmed',
        payment_status: 'full_paid',
        source: 'online',
        notes: `Razorpay: ${razorpay_payment_id}`,
      })
      .select()
      .single()

    if (bookingError) {
      await admin
        .from('slots')
        .update({ status: 'available' })
        .eq('id', slotId)
      bookedSlotIds.pop()
      continue
    }

    if (booking) bookings.push(booking)
  }

  if (bookings.length === 0 && slot_ids.length > 0) {
    return NextResponse.json({ error: 'Failed to create bookings' }, { status: 500 })
  }

  return NextResponse.json({ success: true, bookings })
}
