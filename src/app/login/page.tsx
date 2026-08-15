'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
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
    if (step !== 2 || countdown === 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [step, countdown])

  const handleSendOtp = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (otpError) {
      setError(otpError.message || JSON.stringify(otpError))
    } else {
      setStep(2)
      setCountdown(30)
    }
    setLoading(false)
  }

  const handleResend = async () => {
    setError(null)
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (otpError) {
      setError(otpError.message || JSON.stringify(otpError))
    } else {
      setCountdown(30)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    setError(null)
    if (value && index < 7) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (!pasted) return
    e.preventDefault()
    const next = [...otp]
    pasted.split('').forEach((digit, i) => { next[i] = digit })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 7)]?.focus()
  }

  const handleVerify = async () => {
    submittingRef.current = true
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.join(''),
      type: 'email',
    })

    if (verifyError) {
      submittingRef.current = false
      setError('Invalid or expired code. Please try again.')
      setLoading(false)
      return
    }

    const userId = data.user!.id

    let { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile) {
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: email.split('@')[0],
        role: 'user',
        city: 'Surat',
        created_at: new Date().toISOString(),
      })
      profile = { role: 'user' as const }
    }

    if (profile.role === 'admin') {
      router.push('/admin')
    } else if (profile.role === 'owner') {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  if (!submittingRef.current && (authLoading || user)) return null

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

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
              <p className="text-sm text-surface-800/60 mt-1">
                Enter your email to get started
              </p>
            </div>

            {step === 1 ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-surface-800 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
                    <input
                      id="email"
                      type="email"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-100 border border-surface-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-surface-800/40"
                    />
                  </div>
                  <p className="text-xs text-surface-800/40 mt-1.5">
                    We&apos;ll send a one-time code to verify — no password needed.
                  </p>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  variant="primary"
                  onClick={handleSendOtp}
                  disabled={!isValidEmail || loading}
                  className="w-full mt-1"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-surface-800/70 text-center">
                  Enter the code sent to{' '}
                  <span className="font-medium text-surface-900">{email}</span>
                </p>
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
                      className="w-10 h-12 text-center text-lg font-display font-semibold bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                    />
                  ))}
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <Button
                  variant="primary"
                  onClick={handleVerify}
                  disabled={otp.some((d) => !d) || loading}
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-surface-800/50">
                    Didn&apos;t receive the code?
                  </span>
                  {countdown > 0 ? (
                    <span className="text-surface-800/40 text-sm">Resend in {countdown}s</span>
                  ) : (
                    <button onClick={handleResend} className="text-brand-600 font-medium hover:text-brand-700">
                      Resend
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setStep(1); setOtp(['', '', '', '', '', '', '', '']); setError(null) }}
                  className="text-sm text-brand-600 text-center hover:text-brand-700"
                >
                  Change email
                </button>
              </div>
            )}

            <div className="border-t border-surface-100 mt-6 pt-4">
              <p className="text-sm text-surface-800/60 text-center">
                Are you a venue owner?
              </p>
              <p className="text-xs text-surface-800/40 text-center mt-1">
                Login with your owner email (e.g. urvilk1542@gmail.com) and you&apos;ll be redirected to your dashboard automatically.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
