import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase-server'

function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'CB-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
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

  const { data: court } = await supabase
    .from('courts')
    .select('price_per_slot')
    .eq('id', court_id)
    .eq('venue_id', venue_id)
    .single()

  if (!court) {
    return NextResponse.json({ error: 'Court not found' }, { status: 404 })
  }

  const perSlotAmount = court.price_per_slot

  const bookings = []
  const bookedSlotIds: string[] = []

  for (const slotId of slot_ids) {
    const { error: slotError } = await supabase
      .from('slots')
      .update({ status: 'booked' })
      .eq('id', slotId)
      .eq('status', 'available')

    if (slotError) continue
    bookedSlotIds.push(slotId)

    const { data: booking, error: bookingError } = await supabase
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
      await supabase
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
