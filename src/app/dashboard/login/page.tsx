'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, CalendarCheck, LineChart, Lock, Mail, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const OWNER_ROLES = ['owner', 'admin']

function safeDashboardPath(value: string | null) {
  return value && value.startsWith('/dashboard') && !value.startsWith('/dashboard/login') ? value : '/dashboard'
}

export default function OwnerLoginPage() {
  return (
    <Suspense fallback={null}>
      <OwnerLogin />
    </Suspense>
  )
}

function OwnerLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const destination = safeDashboardPath(searchParams.get('redirect'))
  const isOwner = Boolean(user && OWNER_ROLES.includes(user.role))

  useEffect(() => {
    if (!authLoading && isOwner) router.replace(destination)
  }, [authLoading, isOwner, destination, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    setError(null)
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError || !data.user) {
      setError(signInError?.message === 'Invalid login credentials' ? 'Wrong email or password.' : signInError?.message ?? 'Could not log in.')
      setSubmitting(false)
      return
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    if (profile && OWNER_ROLES.includes(profile.role)) {
      window.location.href = destination
      return
    }
    setSubmitting(false)
  }

  const showNotOwner = !authLoading && user && !isOwner

  return (
    <div className="min-h-screen bg-[#020B12] text-white font-['Geist'] flex flex-col">
      <header className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-[68px] sm:h-[76px] flex items-center justify-between">
        <Link href="/dashboard/login" className="flex items-center gap-2.5">
          <Image src="/figma/logo-icon.svg" alt="" width={34} height={34} className="size-8 sm:size-[34px]" priority />
          <span className="text-[20px] sm:text-[22px] font-semibold tracking-tight">
            Cric<span className="text-[#FBBF24]">Booking</span>
          </span>
          <span className="ml-1 rounded-full border border-white/15 px-2.5 py-0.5 text-[12px] font-medium text-white/70">Owners</span>
        </Link>
        <Link href="/" className="text-[14px] text-white/70 hover:text-white">
          Go to player site
        </Link>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        <section className="hidden lg:flex flex-col gap-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#FBBF24]">Owner dashboard</p>
          <h1 className="text-[52px] font-semibold leading-[1.05] tracking-[-0.035em]">
            Run your turf <span className="text-[#FBBF24]">from one place.</span>
          </h1>
          <ul className="flex flex-col gap-4 text-[16px] text-white/75">
            <li className="flex items-center gap-3"><CalendarCheck className="size-5 text-[#FBBF24]" />Create slots and block days in a few clicks</li>
            <li className="flex items-center gap-3"><LineChart className="size-5 text-[#FBBF24]" />See bookings and revenue as they come in</li>
            <li className="flex items-center gap-3"><ShieldCheck className="size-5 text-[#FBBF24]" />Online payments settled through Razorpay</li>
          </ul>
        </section>

        <section className="w-full max-w-[460px] mx-auto lg:mx-0 lg:justify-self-end rounded-[28px] bg-white text-black p-7 sm:p-10">
          {authLoading ? (
            <div className="h-[320px] animate-pulse rounded-2xl bg-[#f4f6f8]" aria-busy="true" />
          ) : showNotOwner ? (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[26px] font-semibold tracking-tight">This account isn&apos;t a venue owner</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#50555c]">
                  You&apos;re signed in as <span className="font-medium text-black">{user.email}</span>, which is a player account.
                  Log out and sign in with your owner account, or apply to list your venue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => signOut('/dashboard/login')}
                className="w-full rounded-full bg-[#042644] px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-[#06345c]"
              >
                Log out and use owner account
              </button>
              <Link href="/list-venue" className="w-full rounded-full border border-[#e3e5e8] px-6 py-3.5 text-center text-[15px] font-semibold hover:border-[#042644]/40">
                Apply to list your venue
              </Link>
              <Link href="/" className="text-center text-[14px] text-[#50555c] underline underline-offset-2 hover:text-black">
                Back to CricBooking
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <h2 className="text-[28px] font-semibold tracking-tight">Owner log in</h2>
                <p className="mt-1.5 text-[14px] text-[#50555c]">Use the email and password you registered your venue with.</p>
              </div>

              {searchParams.get('reason') === 'signed-out' && (
                <p className="rounded-xl bg-[#f4f6f8] px-4 py-3 text-[13px] text-[#404449]">Please log in to open the owner dashboard.</p>
              )}
              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
              )}

              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-medium">Email address</span>
                <span className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6c6c6c]" />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourturf.in"
                    className="w-full rounded-full border border-[#e3e5e8] bg-white py-3.5 pl-11 pr-5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </span>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-medium">Password</span>
                <span className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6c6c6c]" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-full border border-[#e3e5e8] bg-white py-3.5 pl-11 pr-5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="group mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-6 py-3.5 text-[15px] font-semibold text-[#020B12] hover:bg-[#FBBF24] disabled:opacity-60"
              >
                {submitting ? 'Logging in…' : 'Log in to dashboard'}
                {!submitting && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
              </button>

              <div className="flex flex-col gap-2 border-t border-[#e3e5e8] pt-5 text-center text-[13px] text-[#50555c]">
                <p>
                  New venue owner?{' '}
                  <Link href="/list-venue" className="font-medium text-black underline underline-offset-2">Apply to list your venue</Link>
                </p>
                <p>
                  Forgot your password?{' '}
                  <a href="mailto:support@cricbooking.in?subject=Owner%20password%20reset" className="font-medium text-black underline underline-offset-2">Email support</a>
                </p>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
