// Run: node scripts/check-payment.test.mjs
import assert from 'node:assert/strict'
import { checkPaidOrder } from '../src/lib/paymentCheck.ts'

const base = { userId: 'u1', venueId: 'v1', courtId: 'c1', slotIds: ['s1'] }
const order = (over = {}) => ({
  amount: 90000, amount_paid: 90000, status: 'paid',
  notes: { user_id: 'u1', venue_id: 'v1', court_id: 'c1', slot_ids: '["s1"]' }, ...over,
})

assert.equal(checkPaidOrder({ ...base, order: order() }), null)
assert.match(checkPaidOrder({ ...base, order: order({ status: 'created', amount_paid: 0 }) }), /not been completed/)
assert.match(checkPaidOrder({ ...base, order: order({ amount_paid: 100 }) }), /not been completed/)
assert.match(checkPaidOrder({ ...base, userId: 'someone-else', order: order() }), /does not match this booking/)
assert.match(checkPaidOrder({ ...base, courtId: 'c2', order: order() }), /does not match this booking/)
// paid for one slot, claiming two
assert.match(checkPaidOrder({ ...base, slotIds: ['s1', 's2'], order: order() }), /selected slots/)
// paid for one slot, claiming a different one
assert.match(checkPaidOrder({ ...base, slotIds: ['s9'], order: order() }), /selected slots/)
// same slot listed twice
assert.match(checkPaidOrder({ ...base, slotIds: ['s1', 's1'], order: order() }), /selected slots/)
// broken notes
assert.match(checkPaidOrder({ ...base, order: order({ notes: {} }) }), /does not match/)
console.log('paymentCheck: all checks passed')
