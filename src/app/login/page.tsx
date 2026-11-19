'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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

  useEffect(() => {
    if (!authLoading && user) {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      if (redirect) router.push(redirect)
      else if (user.role === 'owner') router.push('/dashboard')
      else router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (step !== 2 || countdown === 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [step, countdown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (otpError) {
      setError(otpError.message)
    } else {
      setStep(2)
      setCountdown(30)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = otp.join('').trim()
    if (token.length < 6) {
      setError('Please enter the full code')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (verifyError) {
      setError(verifyError.message)
      setLoading(false)
    } else {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect') || '/'
      router.push(redirect)
    }
  }

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[index] = val.slice(-1)
    setOtp(next)

    if (val && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  return (
    <div className="bg-white min-h-screen text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
          {/* Left Column (Navy Feature Card) */}
          <div className="lg:col-span-6 bg-[#042644] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 text-white flex flex-col justify-between gap-8">
            <div className="bg-[#c9f13e] text-black px-3.5 py-1.5 rounded-full text-[13px] font-medium w-fit">
              Welcome back
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-[40px] sm:text-[54px] font-normal tracking-[-0.035em] leading-[1.1] text-white">
                Your next match is two taps away.
              </h1>
              <p className="text-[16px] text-white/75 leading-relaxed">
                Log in to book faster, view verified ticket QR codes, and score live on the pitch.
              </p>
            </div>

            {/* Testimonial pill */}
            <div className="bg-white/10 rounded-[20px] p-4 sm:p-5 flex items-center gap-3.5">
              <span className="size-10 rounded-full bg-[#c9f13e] text-black font-semibold text-sm flex items-center justify-center border-2 border-white shrink-0">
                UK
              </span>
              <div className="text-[14px]">
                <p className="font-medium text-white">Urvil Kargathala · Varachha</p>
                <p className="text-white/70 text-[13px]">“Booked Green Pitch at 7, playing by 8.”</p>
              </div>
            </div>
          </div>

          {/* Right Column (Form Box) */}
          <div className="lg:col-span-6 bg-[#f4f6f8] rounded-[28px] sm:rounded-[36px] p-8 sm:p-14 flex flex-col justify-center">
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-5 max-w-[440px] w-full mx-auto">
                <div>
                  <h2 className="text-[28px] sm:text-[32px] font-medium tracking-tight text-black">
                    Log in or sign up
                  </h2>
                  <p className="text-[14px] text-[#50555c] mt-1.5">
                    Enter your email. We’ll send you an instant login code.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-xl border border-red-200">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-black">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@gmail.com"
                    className="w-full bg-white border border-[#e3e5e8] rounded-full px-5 py-3.5 text-[15px] text-black placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#c9f13e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium flex items-center justify-between w-full active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
                >
                  <span>{loading ? 'Sending code...' : 'Send login code'}</span>
                  <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </button>

                <p className="text-[12px] text-[#767b82] text-center mt-2">
                  By continuing, you agree to CricBooking’s Terms of Service and Privacy Policy.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 max-w-[440px] w-full mx-auto">
                <div>
                  <h2 className="text-[28px] sm:text-[32px] font-medium tracking-tight text-black">
                    Enter verification code
                  </h2>
                  <p className="text-[14px] text-[#50555c] mt-1.5">
                    We sent an 8-digit code to <span className="font-medium text-black">{email}</span>.{' '}
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-black underline ml-1"
                    >
                      Change
                    </button>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-xl border border-red-200">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-8 gap-1 sm:gap-2 w-full max-w-full">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-full aspect-square max-w-[46px] min-w-0 p-0 text-center bg-white border border-[#e3e5e8] rounded-lg sm:rounded-xl text-base sm:text-lg font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#c9f13e]"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group bg-[#c9f13e] hover:bg-[#b8e12d] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium flex items-center justify-between w-full active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                  <span className="size-8 rounded-full bg-black text-[#c9f13e] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </button>

                {countdown > 0 ? (
                  <p className="text-[13px] text-[#767b82] text-center">
                    Resend code in {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[13px] text-black font-medium underline text-center"
                  >
                    Resend code
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
