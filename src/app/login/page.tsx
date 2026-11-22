'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get('redirect')
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/dashboard')) {
      setRedirectTo(redirect)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user && redirectTo) router.replace(redirectTo)
  }, [user, authLoading, redirectTo, router])

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
      router.push(redirectTo || '/')
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

      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
          {/* Left Column (Navy Feature Card) */}
          <div className="lg:col-span-6 bg-[#042644] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 text-white flex flex-col justify-between gap-8">
            <div className="bg-[#F59E0B] text-black px-3.5 py-1.5 rounded-full text-[13px] font-medium w-fit">
              Welcome back
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-[40px] sm:text-[54px] font-normal tracking-[-0.035em] leading-[1.1] text-white">
                Your next match is two taps away.
              </h1>
              <p className="text-[16px] text-white/75 leading-relaxed">
                Log in to book faster and keep every booking ticket in one place.
              </p>
            </div>

            <ul className="bg-white/10 rounded-[20px] p-4 sm:p-5 flex flex-col gap-2.5 text-[14px] text-white/85">
              {['See all your bookings and ticket QR codes', 'Save your favourite turfs to your wishlist', 'Book again in a couple of taps'].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="size-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column (Form Box) */}
          <div className="lg:col-span-6 bg-[#f4f6f8] rounded-[28px] sm:rounded-[36px] p-8 sm:p-14 flex flex-col justify-center">
            {!authLoading && user && !redirectTo ? (
              <div className="flex flex-col gap-5 max-w-[440px] w-full mx-auto">
                <div>
                  <h2 className="text-[28px] sm:text-[32px] font-medium tracking-tight text-black">You&apos;re already logged in</h2>
                  <p className="text-[14px] text-[#50555c] mt-1.5">
                    Signed in as <span className="font-medium text-black">{user.email}</span>
                    {user.role === 'owner' || user.role === 'admin' ? ' (venue owner account).' : '.'}
                  </p>
                </div>
                <Link href="/venues" className="w-full rounded-full bg-[#F59E0B] px-6 py-3 text-center text-[15px] font-medium text-black hover:bg-[#D97706]">
                  Continue to book a turf
                </Link>
                {(user.role === 'owner' || user.role === 'admin') && (
                  <Link href="/dashboard" className="w-full rounded-full bg-[#042644] px-6 py-3 text-center text-[15px] font-medium text-white hover:bg-[#06345c]">
                    Open owner dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => signOut('/login')}
                  className="w-full rounded-full border border-[#d5dbe0] bg-white px-6 py-3 text-[15px] font-medium text-black hover:border-[#042644]/40"
                >
                  Log out and use another account
                </button>
              </div>
            ) : step === 1 ? (
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
                  <label htmlFor="login-email" className="text-[13px] font-medium text-black">Email address</label>
                  <input
                    id="login-email"
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@gmail.com"
                    className="w-full bg-white border border-[#e3e5e8] rounded-full px-5 py-3.5 text-[15px] text-black placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium flex items-center justify-between w-full active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
                >
                  <span>{loading ? 'Sending code...' : 'Send login code'}</span>
                  <span className="size-8 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </button>

                <Link href="/dashboard/login" className="text-[13px] font-medium text-black underline underline-offset-2 text-center">
                  Venue owner? Log in to the owner dashboard
                </Link>

                <p className="text-[12px] text-[#5f656c] text-center">
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
                      className="w-full aspect-square max-w-[46px] min-w-0 p-0 text-center bg-white border border-[#e3e5e8] rounded-lg sm:rounded-xl text-base sm:text-lg font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium flex items-center justify-between w-full active:scale-95 disabled:opacity-50 mt-2 shadow-sm"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                  <span className="size-8 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
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
