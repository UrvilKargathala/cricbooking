'use client'

import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useToastStore } from '@/store/useToastStore'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const showToast = useToastStore((s) => s.showToast)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    showToast('Message sent! Our Surat team will reach out within 2 hours.', 'success')
  }

  return (
    <div className="bg-white min-h-screen text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Title Header */}
        <div className="max-w-[700px] mb-10 sm:mb-14">
          <div className="bg-[#c9f13e] text-black px-3.5 py-1.5 rounded-full text-[13px] font-medium w-fit mb-4">
            Direct Support
          </div>
          <h1 className="text-[38px] sm:text-[52px] font-normal tracking-[-1.68px] leading-[1.1] text-black">
            Get in touch with the CricBooking team.
          </h1>
          <p className="text-[16px] sm:text-[18px] text-[#50555c] mt-4 leading-relaxed">
            Have a question about a booking, need payment help, or want to list your turf in Surat? We respond fast.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
          {/* Left Column: Dark Navy Info Card */}
          <div className="lg:col-span-5 bg-[#042644] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 text-white flex flex-col justify-between gap-8">
            <div>
              <span className="text-[13px] uppercase font-semibold text-[#c9f13e] tracking-wider">
                Support Office
              </span>
              <h2 className="text-[28px] sm:text-[32px] font-normal text-white mt-2 tracking-tight">
                Surat, Gujarat
              </h2>
            </div>

            <div className="flex flex-col gap-5 text-[15px]">
              <a
                href="tel:+919427508129"
                className="flex items-center gap-3.5 hover:text-[#c9f13e] transition-colors"
              >
                <span className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-white/60">Phone Support</p>
                  <p className="text-base font-medium">+91 94275 08129</p>
                </div>
              </a>

              <a
                href="mailto:support@cricbooking.in"
                className="flex items-center gap-3.5 hover:text-[#c9f13e] transition-colors"
              >
                <span className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-white/60">Email Inquiries</p>
                  <p className="text-base font-medium">support@cricbooking.in</p>
                </div>
              </a>

              <div className="flex items-center gap-3.5">
                <span className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-white/60">Location</p>
                  <p className="text-base font-medium">Amroli, Surat, Gujarat 394107</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 text-[13px] text-white/80 leading-relaxed">
              ⚡ Available 24/7 for emergency match cancellations, slot issues, and turf owner onboardings.
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-[#f4f6f8] rounded-[28px] sm:rounded-[36px] p-8 sm:p-14 flex flex-col justify-center">
            {submitted ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <CheckCircle2 className="size-14 text-emerald-600 mb-4" />
                <h3 className="text-[24px] font-medium text-black">Message received!</h3>
                <p className="text-[14px] text-[#50555c] mt-2 max-w-sm">
                  Thank you for reaching out. One of our team members in Surat will contact you via phone or email shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setForm({ name: '', email: '', phone: '', message: '' })
                  }}
                  className="mt-6 bg-black text-white px-6 py-2.5 rounded-full text-[14px] font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[500px] w-full mx-auto">
                <div>
                  <h3 className="text-[26px] sm:text-[28px] font-medium tracking-tight text-black">
                    Send a message
                  </h3>
                  <p className="text-[14px] text-[#50555c] mt-1">
                    Fill out the form and we will get back to you promptly.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[13px] font-medium text-black">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Urvil Patel"
                    className="w-full bg-white border border-[#e3e5e8] rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#c9f13e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-black">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@gmail.com"
                      className="w-full bg-white border border-[#e3e5e8] rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#c9f13e]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-black">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-[#e3e5e8] rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#c9f13e]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-black">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what you need help with or details about your turf..."
                    className="w-full bg-white border border-[#e3e5e8] rounded-[20px] px-5 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#c9f13e]"
                  />
                </div>

                <button
                  type="submit"
                  className="group bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium flex items-center justify-between w-full active:scale-95 shadow-sm mt-2"
                >
                  <span>Submit message</span>
                  <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
