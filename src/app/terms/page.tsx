'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[880px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="bg-[#F59E0B] text-black px-3.5 py-1.5 rounded-full text-[13px] font-medium w-fit mb-4">
          Legal
        </div>
        <h1 className="text-[36px] sm:text-[48px] font-normal tracking-[-1.68px] text-black leading-tight">
          Terms of Service
        </h1>
        <p className="text-[14px] text-[#50555c] mt-2 mb-8">Last updated: November 2026 · CricBooking Surat</p>

        <div className="bg-[#f4f6f8] rounded-[28px] p-8 sm:p-12 flex flex-col gap-8 text-[15px] text-[#404449] leading-relaxed">
          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">1. Using CricBooking</h2>
            <p>
              CricBooking lets players discover and book cricket turfs, box cricket arenas, and grounds across Surat, Gujarat. By reserving a slot through our platform, you agree to follow the turf&apos;s venue guidelines, respect equipment, and arrive promptly at your scheduled start time.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">2. Bookings &amp; ₹0 Platform Fee</h2>
            <p>
              CricBooking charges ₹0 booking fee to players. What you see is exactly the turf owner&apos;s listed hourly court price. All payments are securely processed through authorized UPI / Razorpay gateways, and confirmation tickets are issued immediately upon payment success.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">3. Cancellations &amp; Refunds</h2>
            <p>
              Each venue specifies its cancellation policy (e.g., up to 4 hours before match start for an 80% refund). Cancellation eligibility is displayed clearly on each turf details page and during checkout.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">4. Venue Owners</h2>
            <p>
              Turf owners listing on CricBooking are responsible for maintaining court turf quality, lighting conditions, and timely access for booked players.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">5. Contact Support</h2>
            <p>
              Questions regarding bookings, payments, or disputes can be addressed anytime to{' '}
              <a href="mailto:support@cricbooking.in" className="text-black font-medium underline">
                support@cricbooking.in
              </a>{' '}
              or by phone at +91 94275 08129.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
