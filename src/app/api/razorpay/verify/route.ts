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
    amount,
  } = await req.json()

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const bookings = []
  for (const slotId of slot_ids) {
    const { error: slotError } = await supabase
      .from('slots')
      .update({ status: 'booked' })
      .eq('id', slotId)
      .eq('status', 'available')

    if (slotError) continue

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_code: generateBookingCode(),
        user_id: user.id,
        booked_by: user.id,
        venue_id,
        court_id,
        slot_id: slotId,
        amount: amount / slot_ids.length,
        status: 'confirmed',
        payment_status: 'full_paid',
        source: 'online',
        notes: `Razorpay: ${razorpay_payment_id}`,
      })
      .select()
      .single()

    if (!bookingError && booking) {
      bookings.push(booking)
    }
  }

  return NextResponse.json({ success: true, bookings })
}
