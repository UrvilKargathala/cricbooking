'use client'

import { useState, type FormEvent } from 'react'
import { Mail, Phone, MapPin, Send, Headphones, Building2, MessageSquareHeart } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/useToastStore'

const CONTACT_TOPICS = [
  {
    icon: Headphones,
    title: 'Player Support',
    description: 'Questions about a booking, slot availability, or payment — our team is here around the clock.',
  },
  {
    icon: Building2,
    title: 'List Your Venue',
    description: 'Own a turf or ground in Surat? Reach out to get listed on CricBooking, free of cost.',
  },
  {
    icon: MessageSquareHeart,
    title: 'Feedback & Suggestions',
    description: 'Tell us what is working and what is not. Your input shapes what we build next.',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const showToast = useToastStore((s) => s.showToast)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    showToast('Message sent! Our team will get back to you shortly.', 'success')
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />
      <main className="text-surface-800">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: info */}
          <div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-surface-900 text-balance">Contact Us</h1>
            <p className="mt-4 text-surface-800/60 text-lg max-w-md">
              Call, email, or fill out the form and our team will help you find the right turf in Surat.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <a href="mailto:support@cricbooking.in" className="flex items-center gap-2.5 text-surface-800 hover:text-brand-600">
                <Mail className="w-4.5 h-4.5 text-brand-600" />
                support@cricbooking.in
              </a>
              <a href="tel:+919825012345" className="flex items-center gap-2.5 text-surface-800 hover:text-brand-600">
                <Phone className="w-4.5 h-4.5 text-brand-600" />
                +91 9427508129
              </a>
              <span className="flex items-center gap-2.5 text-surface-800">
                <MapPin className="w-4.5 h-4.5 text-brand-600" />
                Vesu, Surat, Gujarat
              </span>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6">
              {CONTACT_TOPICS.map((topic) => (
                <div key={topic.title} className="flex gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                    <topic.icon className="w-4.5 h-4.5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-surface-900">{topic.title}</h3>
                    <p className="text-sm text-surface-800/50 mt-1 leading-relaxed max-w-sm">{topic.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="font-display font-bold text-2xl text-surface-900">Get in Touch</h2>
            <p className="text-sm text-surface-800/50 mt-1">We usually reply within a few hours</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <Input
                label="Your Name"
                placeholder="Urvil Kargathala"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                placeholder="+91 9427508129"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-surface-800 mb-1.5">
                  How can we help?
                </label>
                <textarea
                  id="message"
                  rows={4}
                  maxLength={500}
                  placeholder="Tell us what you need..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm placeholder:text-surface-800/40 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                />
                <p className="text-xs text-surface-800/40 mt-1 text-right">{form.message.length}/500</p>
              </div>

              <Button type="submit" variant="primary" size="lg" className="mt-2">
                <span className="flex items-center justify-center gap-1.5">
                  Send Message <Send className="w-4 h-4" />
                </span>
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
