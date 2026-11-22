import { NextResponse } from 'next/server'
import { createServiceRoleClient, getAuthedUser } from '@/lib/supabase-server'

const MAX_ACCOUNT_AGE_MS = 60 * 60 * 1000

function text(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const admin = createServiceRoleClient()
  const signedIn = await getAuthedUser()
  const userId = signedIn?.id ?? text(body.user_id, 64)
  const email = text(body.email, 200).toLowerCase()

  if (!userId || !email) {
    return NextResponse.json({ error: 'Missing account details' }, { status: 400 })
  }

  // Without a session (email confirmation pending), only accept a brand-new account whose email matches.
  if (!signedIn) {
    const { data, error } = await admin.auth.admin.getUserById(userId)
    const account = data?.user
    if (error || !account || account.email?.toLowerCase() !== email) {
      return NextResponse.json({ error: 'Account not found' }, { status: 403 })
    }
    if (Date.now() - new Date(account.created_at).getTime() > MAX_ACCOUNT_AGE_MS) {
      return NextResponse.json({ error: 'Please log in to submit your application' }, { status: 401 })
    }
  }

  const { data: existing } = await admin.from('owner_applications').select('id').eq('user_id', userId).maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'You have already applied. We will contact you soon.' }, { status: 409 })
  }

  const mobile = text(body.mobile, 10)
  if (!/^\d{10}$/.test(mobile)) {
    return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 })
  }

  const { error: insertError } = await admin.from('owner_applications').insert({
    user_id: userId,
    owner_name: text(body.owner_name),
    mobile,
    email,
    business_name: text(body.business_name),
    business_address: text(body.business_address, 500),
    city: text(body.city, 100),
    state: text(body.state, 100),
    pincode: text(body.pincode, 6),
    number_of_venues: Number(body.number_of_venues) || 1,
    basic_turf_info: text(body.basic_turf_info, 1000) || null,
    identity_document: text(body.identity_document, 300) || null,
    business_document: text(body.business_document, 300) || null,
    bank_name: text(body.bank_name, 100) || null,
    account_holder: text(body.account_holder, 100) || null,
    account_number: text(body.account_number, 30) || null,
    ifsc_code: text(body.ifsc_code, 11).toUpperCase() || null,
    upi_id: text(body.upi_id, 100) || null,
  })
  if (insertError) {
    return NextResponse.json({ error: 'Could not save your application. Please try again.' }, { status: 500 })
  }

  await admin
    .from('profiles')
    .update({ full_name: text(body.owner_name), phone: `+91${mobile}` })
    .eq('id', userId)

  return NextResponse.json({ success: true })
}
