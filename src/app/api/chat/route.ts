import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createServerSupabaseClient } from '@/lib/supabase-server'

async function getVenueContext() {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, slug, address, rating, sports, amenities, area:areas(name), courts(id, name, price_per_slot)')
    .eq('status', 'approved')
    .order('rating', { ascending: false })
    .limit(10)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dates = [today, tomorrow.toISOString().slice(0, 10)]

  const courtIds = (venues || []).flatMap((v) => (v.courts || []).map((c: { id: string }) => c.id))

  let slotsInfo = ''
  if (courtIds.length > 0) {
    const { data: slots } = await supabase
      .from('slots')
      .select('court_id, date, start_time, end_time, price, status')
      .in('court_id', courtIds)
      .in('date', dates)
      .eq('status', 'available')
      .order('start_time')
      .limit(50)

    if (slots && slots.length > 0) {
      slotsInfo = `\n\nAvailable slots for today/tomorrow:\n${JSON.stringify(slots)}`
    }
  }

  const venueList = (venues || []).map((v) => {
    const areaData = v.area as unknown as { name: string } | { name: string }[] | null
    const area = (Array.isArray(areaData) ? areaData[0]?.name : areaData?.name) || 'Surat'
    const prices = (v.courts || []).map((c: { price_per_slot: number }) => c.price_per_slot)
    const minPrice = prices.length ? Math.min(...prices) : 0
    return `- ${v.name} (${area}) | Rating: ${v.rating}/5 | From ₹${minPrice}/slot | Sports: ${(v.sports || []).join(', ')} | Amenities: ${(v.amenities || []).join(', ')} | Book at: /venues/${v.slug}`
  }).join('\n')

  return `\n\nVenues on CricBooking:\n${venueList}${slotsInfo}`
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI chat not configured. Add GEMINI_API_KEY to environment.' }, { status: 503 })
  }

  const { messages } = await req.json()
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const venueContext = await getVenueContext()
    const today = new Date().toISOString().slice(0, 10)

    const systemPrompt = `You are CricBooking Assistant — a helpful AI for booking cricket turfs and grounds in Surat, Gujarat, India.

You help users:
- Find venues by area, sport, or amenities
- Check slot availability for specific dates and times
- Understand pricing
- Answer questions about the booking process

Keep responses short and friendly. Use ₹ for prices. Format times in 12-hour AM/PM.
If you're unsure about something, say so honestly. Never make up venue names or availability.
Always respond in the same language the user uses.
When suggesting a venue, include the booking link as /venues/[slug].
Today's date is ${today}.
${venueContext}`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: systemPrompt,
    })

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })
    const lastMessage = messages[messages.length - 1].content
    const result = await chat.sendMessage(lastMessage)
    const text = result.response.text()

    return NextResponse.json({ reply: text || 'Sorry, I could not process that.' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
