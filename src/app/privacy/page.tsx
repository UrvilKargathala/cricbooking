'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[880px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="bg-[#F59E0B] text-black px-3.5 py-1.5 rounded-full text-[13px] font-medium w-fit mb-4">
          Privacy
        </div>
        <h1 className="text-[36px] sm:text-[48px] font-normal tracking-[-1.68px] text-black leading-tight">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-[#50555c] mt-2 mb-8">Last updated: November 2026 · CricBooking Surat</p>

        <div className="bg-[#f4f6f8] rounded-[28px] p-8 sm:p-12 flex flex-col gap-8 text-[15px] text-[#404449] leading-relaxed">
          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">1. Information We Collect</h2>
            <p>
              We collect your email, phone number, and name when you create an account or book a cricket turf in Surat. We use this strictly to deliver your booking confirmation, ticket details, and match notifications.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">2. Payment Security</h2>
            <p>
              All online transactions are processed through RBI-authorized payment aggregators (Razorpay / UPI). CricBooking does not store your credit card numbers or UPI PINs on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">3. Data Sharing</h2>
            <p>
              Your contact information is shared only with the specific venue owner of the turf you book, strictly for ground access and match coordination. We never sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-black mb-2 tracking-tight">4. Your Rights</h2>
            <p>
              You may request a copy of your personal data or request deletion of your account and booking history at any time by contacting{' '}
              <a href="mailto:support@cricbooking.in" className="text-black font-medium underline">
                support@cricbooking.in
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
