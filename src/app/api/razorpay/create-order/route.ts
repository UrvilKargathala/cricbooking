import { NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'
import { createServerSupabaseClient, getAuthedUser } from '@/lib/supabase-server'


export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const user = await getAuthedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slot_ids, venue_id, court_id } = await req.json()

  if (!slot_ids?.length || !venue_id || !court_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

  const { data: freshSlots } = await supabase
    .from('slots')
    .select('id, status, price, court_id, date, start_time')
    .in('id', slot_ids)

  if (!freshSlots || freshSlots.length !== slot_ids.length || freshSlots.some((s) => s.court_id !== court_id)) {
    return NextResponse.json({ error: 'Some slots could not be found for this court' }, { status: 400 })
  }

  if (freshSlots.some((s) => s.status !== 'available')) {
    return NextResponse.json({ error: 'Some slots are no longer available' }, { status: 409 })
  }

  const nowInIndia = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
  if (freshSlots.some((s) => `${s.date} ${s.start_time}` <= nowInIndia)) {
    return NextResponse.json({ error: 'One of these slots has already started. Please pick a later time.' }, { status: 409 })
  }

  const amount = freshSlots.reduce((sum, s) => sum + (Number(s.price) || court.price_per_slot), 0)

  const order = await getRazorpay().orders.create({
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
