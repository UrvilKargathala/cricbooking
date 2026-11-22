import Razorpay from 'razorpay'

let client: Razorpay | null = null

export function getRazorpay() {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return client
}
