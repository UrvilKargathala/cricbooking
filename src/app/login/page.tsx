'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(30)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const submittingRef = useRef(false)

  useEffect(() => {
    if (submittingRef.current) return
    if (!authLoading && user) {
      if (user.role === 'admin') router.push('/admin')
      else if (user.role === 'owner') router.push('/dashboard')
      else router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (step !== 'otp' || countdown === 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [step, countdown])

  const sendOtp = async () => {
    const supabase = createClient()
    const { data, error: fnError } = await supabase.functions.invoke('otp-send', {
      body: { phone: '+91' + phone },
    })
    if (fnError || data?.error) {
      setError(data?.error || 'Could not send OTP. Please try again.')
      return false
    }
    setDevCode(data.devCode ?? null)
    return true
  }

  const handleSendOtp = async () => {
    setLoading(true)
    setError(null)
    if (await sendOtp()) {
      setStep('otp')
      setCountdown(30)
    }
    setLoading(false)
  }

  const handleResend = async () => {
    setError(null)
    if (await sendOtp()) setCountdown(30)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = [...otp]
    pasted.split('').forEach((digit, i) => { next[i] = digit })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    submittingRef.current = true
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: fnError } = await supabase.functions.invoke('otp-verify', {
      body: { phone: '+91' + phone, code: otp.join('') },
    })

    if (fnError || data?.error) {
      submittingRef.current = false
      setError(data?.error || 'Invalid OTP. Please try again.')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      submittingRef.current = false
      setError('Could not sign you in. Please try again.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  if (!submittingRef.current && (authLoading || user)) return null

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)]">
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=1200"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 via-surface-900/20 to-transparent" />
          <div className="absolute bottom-12 left-10 right-10">
            <h2 className="font-display font-bold text-3xl text-white">Book Your Next Match</h2>
            <p className="mt-2 text-white/80 max-w-sm">
              Real-time slot availability across Surat&apos;s best turfs and grounds — booked in seconds.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center mb-8">
              <img src="/logo-icon.png" alt="" className="w-12 h-12 mb-3" />
              <h1 className="font-display font-bold text-xl text-surface-900">Welcome to CricBooking</h1>
            </div>

            {step === 'phone' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-surface-800 mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex items-stretch rounded-lg border border-surface-200 bg-surface-100 overflow-hidden focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-transparent">
                    <span className="flex items-center gap-1.5 px-3 border-r border-surface-200 text-sm font-medium text-surface-800">
                      <Phone className="w-4 h-4 text-surface-800/40" />
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-sm focus:outline-none placeholder:text-surface-800/40"
                    />
                  </div>
                  <p className="text-xs text-surface-800/50 mt-1.5">
                    We&apos;ll text a one-time code to verify it&apos;s you — no spam, no calls.
                  </p>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button variant="primary" onClick={handleSendOtp} disabled={phone.length !== 10 || loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-surface-800/70 text-center">
                  Enter OTP sent to +91 {phone}
                </p>
                {devCode && (
                  <p className="text-xs text-center bg-amber-50 text-amber-800 rounded-lg px-3 py-2">
                    Dev mode (no SMS provider configured) — your code is <span className="font-mono font-semibold">{devCode}</span>
                  </p>
                )}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-12 text-center text-lg font-display font-semibold bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                    />
                  ))}
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <Button
                  variant="primary"
                  onClick={handleVerify}
                  disabled={otp.some((d) => !d) || loading}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <div className="text-center text-sm">
                  {countdown > 0 ? (
                    <span className="text-surface-800/50">Resend OTP in {countdown}s</span>
                  ) : (
                    <button onClick={handleResend} className="text-brand-600 hover:text-brand-700 font-medium">
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            <p className="text-sm text-center mt-6 text-surface-800/60">
              Are you a venue owner?{' '}
              <a href="/dashboard/login" className="text-brand-600 font-medium hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
