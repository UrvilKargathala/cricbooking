export interface PaidOrder {
  amount: number | string
  amount_paid: number | string
  status: string
  notes?: Record<string, unknown> | unknown[]
}

/**
 * Checks that a Razorpay order was fully paid AND was created (by our server)
 * for exactly this user, venue, court and set of slots.
 * Returns an error message, or null when everything matches.
 */
export function checkPaidOrder(p: {
  order: PaidOrder
  userId: string
  venueId: string
  courtId: string
  slotIds: string[]
}): string | null {
  const { order } = p
  if (order.status !== 'paid' || Number(order.amount_paid) < Number(order.amount)) {
    return 'Payment has not been completed'
  }

  const notes = (Array.isArray(order.notes) ? {} : order.notes ?? {}) as Record<string, unknown>
  if (notes.user_id !== p.userId || notes.venue_id !== p.venueId || notes.court_id !== p.courtId) {
    return 'Payment does not match this booking'
  }

  let paidSlots: string[]
  try {
    paidSlots = JSON.parse(String(notes.slot_ids))
  } catch {
    return 'Payment does not match this booking'
  }

  const asked = [...p.slotIds].sort()
  const paid = [...paidSlots].sort()
  if (new Set(asked).size !== asked.length || asked.length !== paid.length || asked.some((id, i) => id !== paid[i])) {
    return 'Payment does not match the selected slots'
  }
  return null
}
