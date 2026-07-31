'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', ''])
  const [countdown, setCountdown] = useState(30)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step !== 'otp' || countdown === 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [step, countdown])

  const handleSendOtp = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
      setCountdown(30)
    }, 1500)
  }

  const handleResend = () => {
    setCountdown(30)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 3) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push('/')
    }, 1500)
  }

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
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-surface-100 border border-surface-200 rounded-lg text-sm text-surface-800">
                    +91
                  </span>
                  <Input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1"
                    maxLength={10}
                  />
                </div>
                <Button variant="primary" onClick={handleSendOtp} disabled={phone.length !== 10 || loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-surface-800/70 text-center">
                  Enter OTP sent to +91 {phone || '9427508129'}
                </p>
                <div className="flex justify-center gap-3">
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
                      className="w-12 h-12 text-center text-lg font-display font-semibold bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                    />
                  ))}
                </div>
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
          </div>
        </div>
      </main>
    </>
  )
}
