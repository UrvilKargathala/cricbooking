import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

  const { amount, slot_ids, venue_id, court_id } = await req.json()

  if (!amount || !slot_ids?.length || !venue_id || !court_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: freshSlots } = await supabase
    .from('slots')
    .select('id, status')
    .in('id', slot_ids)

  const unavailable = freshSlots?.filter((s) => s.status !== 'available')
  if (unavailable && unavailable.length > 0) {
    return NextResponse.json({ error: 'Some slots are no longer available' }, { status: 409 })
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    notes: {
      user_id: user.id,
      venue_id,
      court_id,
      slot_ids: JSON.stringify(slot_ids),
    },
  })

  return NextResponse.json({ order_id: order.id, amount: order.amount, currency: order.currency })
}
