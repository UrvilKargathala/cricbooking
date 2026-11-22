'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Upload, X, Check, Eye, EyeOff, FileText, ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const inputClass =
  'w-full px-4 py-3 bg-white border border-[#e3e5e8] rounded-[12px] text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent placeholder:text-[#767b82] transition-all'
const errorClass = 'border-red-500/50 focus:ring-red-500/50'

function FileUploadZone({
  label,
  file,
  onSelect,
  onRemove,
  error,
}: {
  label: string
  file: File | null
  onSelect: (f: File) => void
  onRemove: () => void
  error?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onSelect(f)
          e.target.value = ''
        }}
      />
      {file ? (
        <div className="flex items-center gap-3 bg-white border border-[#e3e5e8] rounded-[12px] p-3.5">
          <FileText className="w-5 h-5 text-black shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-black truncate">{file.name}</p>
            <p className="text-[12px] text-[#6c6c6c]">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={onRemove} className="text-[#6c6c6c] hover:text-red-500 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={cn(
            'w-full bg-white border border-dashed rounded-[12px] p-4 text-center cursor-pointer hover:border-black transition-colors',
            error ? 'border-red-500/50' : 'border-[#e3e5e8]'
          )}
        >
          <Upload className="w-5 h-5 text-[#6c6c6c] mx-auto" />
          <p className="text-[14px] text-black mt-1.5 font-medium">{label}</p>
          <p className="text-[12px] text-[#6c6c6c] mt-0.5">JPG, PNG, PDF — max 5MB</p>
        </button>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function ListVenuePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ownerName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessAddress: '',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '',
    numberOfVenues: 1,
    basicTurfInfo: '',
    identityDoc: null as File | null,
    businessDoc: null as File | null,
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    agreedToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const [confirmCode, setConfirmCode] = useState('')
  const [confirmState, setConfirmState] = useState<'idle' | 'checking' | 'done' | 'error'>('idle')
  const { user, signOut } = useAuth()
  const signedIn = Boolean(user)
  const isOwner = Boolean(user && (user.role === 'owner' || user.role === 'admin'))

  useEffect(() => {
    if (!user) return
    setFormData((prev) => ({
      ...prev,
      email: user.email ?? prev.email,
      ownerName: prev.ownerName || user.full_name || '',
      mobile: prev.mobile || (user.phone ?? '').replace(/^\+91/, '').replace(/\D/g, '').slice(-10),
    }))
  }, [user])

  const update = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.ownerName.trim()) errs.ownerName = 'Name is required'
    if (!/^\d{10}$/.test(formData.mobile)) errs.mobile = 'Enter a valid 10-digit number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email'
    if (!signedIn && formData.password.length < 8) errs.password = 'Minimum 8 characters'
    if (!signedIn && formData.confirmPassword !== formData.password) errs.confirmPassword = 'Passwords do not match'
    if (!formData.businessName.trim()) errs.businessName = 'Business name is required'
    if (!formData.businessAddress.trim()) errs.businessAddress = 'Address is required'
    if (!/^\d{6}$/.test(formData.pincode)) errs.pincode = 'Enter a valid 6-digit pincode'
    if (!formData.agreedToTerms) errs.agreedToTerms = 'You must agree to the terms'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      let userId = user?.id ?? null
      if (!userId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.ownerName } },
        })

        if (authError) {
          if (
            authError.message.toLowerCase().includes('already registered') ||
            authError.message.toLowerCase().includes('already been registered')
          ) {
            setError(
              'This email already has a CricBooking account. Log in with it first, then come back to this page to apply.'
            )
          } else {
            setError(authError.message)
          }
          setLoading(false)
          return
        }

        if (authData.user && authData.user.identities?.length === 0) {
          setError('This email already has a CricBooking account. Log in with it first, then come back to this page to apply.')
          setLoading(false)
          return
        }
        userId = authData.user?.id ?? null
        if (userId && !authData.session) setNeedsConfirm(true)
      }
      if (!userId) {
        setSubmitted(true)
        setLoading(false)
        return
      }

      let identityDocUrl: string | null = null
      let businessDocUrl: string | null = null

      if (formData.identityDoc) {
        const ext = formData.identityDoc.name.split('.').pop()
        const { data: uploadData } = await supabase.storage
          .from('owner-documents')
          .upload(`${userId}/identity-${Date.now()}.${ext}`, formData.identityDoc)
        if (uploadData) identityDocUrl = uploadData.path
      }

      if (formData.businessDoc) {
        const ext = formData.businessDoc.name.split('.').pop()
        const { data: uploadData } = await supabase.storage
          .from('owner-documents')
          .upload(`${userId}/business-${Date.now()}.${ext}`, formData.businessDoc)
        if (uploadData) businessDocUrl = uploadData.path
      }

      const res = await fetch('/api/owner-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          owner_name: formData.ownerName,
          mobile: formData.mobile,
          email: formData.email,
          business_name: formData.businessName,
          business_address: formData.businessAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          number_of_venues: formData.numberOfVenues,
          basic_turf_info: formData.basicTurfInfo,
          identity_document: identityDocUrl,
          business_document: businessDocUrl,
          bank_name: formData.bankName,
          account_holder: formData.accountHolder,
          account_number: formData.accountNumber,
          ifsc_code: formData.ifscCode,
          upi_id: formData.upiId,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'Could not submit your application. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
          {/* Main Hero Card (8 cols) */}
          <div className="lg:col-span-8 relative min-h-[360px] sm:min-h-[440px] rounded-[24px] sm:rounded-[32px] overflow-hidden p-6 sm:p-12 flex flex-col justify-end bg-[#042644] shadow-[0_22px_48px_rgb(4_38_68_/_0.18)]">
            <Image
              src="/figma/owner-banner.png"
              alt="Turf owner banner"
              fill
              className="object-cover opacity-60" sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#042644] via-[#042644]/55 to-transparent" />
            <div className="absolute top-5 left-5 sm:top-7 sm:left-7 flex items-center gap-2 rounded-full border border-white/15 bg-[#061923]/45 px-3.5 py-2 text-[12px] font-medium text-white/80 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#F59E0B] shadow-[0_0_12px_#F59E0B]" />
              Trusted by local venue owners
            </div>

            <div className="relative z-10 flex flex-col items-start gap-4">
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 border border-white/15">
                <span className="size-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[12px] font-medium text-[#FBBF24] uppercase tracking-wider">
                  List your venue
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[36px] sm:text-[56px] font-normal tracking-tight text-white leading-tight">
                <span>Fill your empty</span>
                <span className="bg-[#F59E0B] text-black px-4 py-0.5 rounded-2xl font-normal inline-block">
                  hours.
                </span>
              </div>

              <p className="text-[15px] sm:text-[18px] text-white/80 max-w-xl font-normal">
                List your turf on CricBooking for free and start taking online bookings this week.
              </p>
            </div>
          </div>

          {/* Right Feature Card (4 cols) */}
          <div className="lg:col-span-4 relative min-h-[280px] lg:min-h-[440px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-[#dde3ea] shadow-[0_22px_48px_rgb(4_38_68_/_0.12)]">
            <Image
              src="/figma/venue-royal-box.png"
              alt="Turf preview"
              fill
              className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061923]/90 via-[#061923]/5 to-transparent" />
            <div className="absolute top-4 right-4 bg-[#F59E0B] px-4 py-2 rounded-full text-[13px] font-semibold text-black shadow-md">
              Free listing
            </div>
            <div className="absolute inset-x-5 bottom-5 text-white">
              <p className="text-[12px] uppercase tracking-[0.14em] text-[#FBBF24] font-bold">Your venue, online</p>
              <p className="mt-1 text-[21px] font-medium tracking-tight">Make every open hour bookable.</p>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-white/75">
                <span className="rounded-full bg-white/15 px-2.5 py-1">Online payments</span>
                <span className="rounded-full bg-white/15 px-2.5 py-1">Live slots</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form & Value Props Section */}
        {isOwner && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[20px] border border-[#F59E0B]/40 bg-[#FEF7E6] px-5 py-4">
            <p className="text-[14px] text-[#92400E]">
              You already have owner access. Add more venues from your dashboard instead of applying again.
            </p>
            <Link href="/dashboard/venues" className="shrink-0 rounded-full bg-[#042644] px-5 py-2.5 text-center text-[14px] font-medium text-white hover:bg-[#06345c]">
              Open owner dashboard
            </Link>
          </div>
        )}

        {submitted ? (
          <div className="bg-[#f4f6f8] rounded-[28px] p-8 sm:p-12 text-center max-w-xl mx-auto mb-16">
            <div className="w-16 h-16 rounded-full bg-[#F59E0B] mx-auto flex items-center justify-center text-black">
              <Check className="w-8 h-8" strokeWidth={3} />
            </div>
            <h2 className="text-[28px] font-medium text-black mt-5 tracking-tight">
              Application Submitted!
            </h2>
            <p className="text-[15px] text-[#50555c] mt-2">
              Thank you, <strong className="text-black">{formData.ownerName}</strong>! Your application for{' '}
              <strong className="text-black">{formData.businessName}</strong> has been received.
            </p>
            <p className="text-[13px] text-[#6c6c6c] mt-1">
              Our team will verify your details and activate your venue within 48 hours.
            </p>

            {needsConfirm && confirmState !== 'done' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (confirmCode.trim().length < 6) return
                  setConfirmState('checking')
                  const { error: verifyError } = await createClient().auth.verifyOtp({
                    email: formData.email.trim(),
                    token: confirmCode.trim(),
                    type: 'signup',
                  })
                  setConfirmState(verifyError ? 'error' : 'done')
                }}
                className="mt-7 rounded-2xl bg-white p-5 text-left"
              >
                <p className="text-[15px] font-medium text-black">Confirm your email</p>
                <p className="mt-1 text-[13px] text-[#50555c]">
                  We sent a code to <span className="font-medium text-black">{formData.email}</span>. Enter it so you can log in once you&apos;re approved.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Email confirmation code"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="8-digit code"
                    className="min-w-0 flex-1 rounded-full border border-[#e3e5e8] px-4 py-2.5 text-[15px] tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  <button
                    type="submit"
                    disabled={confirmState === 'checking'}
                    className="shrink-0 rounded-full bg-[#042644] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#06345c] disabled:opacity-60"
                  >
                    {confirmState === 'checking' ? 'Checking…' : 'Confirm'}
                  </button>
                </div>
                {confirmState === 'error' && (
                  <p role="alert" className="mt-2 text-[13px] text-red-600">That code didn&apos;t work. Check the latest email and try again.</p>
                )}
              </form>
            )}
            {confirmState === 'done' && (
              <p className="mt-6 rounded-2xl bg-white px-5 py-4 text-[14px] text-[#92400E]">
                Email confirmed. Once we approve your application, log in at the owner dashboard with this email and your password.
              </p>
            )}
            <button
              onClick={() => router.push('/')}
              className="mt-8 bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black px-6 py-3 rounded-full text-[14px] font-medium inline-flex items-center gap-2"
            >
              <span>Back to home</span>
              <ArrowUpRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mb-16">
            {/* Left Value Props (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-[#F59E0B] rounded-[20px] p-7 flex flex-col justify-between shadow-[0_14px_28px_rgb(201_241_62_/_0.22)]">
                <span className="text-[44px] font-semibold text-black leading-none">₹0</span>
                <span className="text-[16px] text-black/80 font-normal mt-3">to list, forever</span>
              </div>

              <div className="bg-white border border-[#e3e5e8] rounded-[20px] p-7 flex flex-col justify-between shadow-[0_10px_24px_rgb(4_38_68_/_0.05)]">
                <span className="text-[44px] font-semibold text-black leading-none">48 hr</span>
                <span className="text-[16px] text-[#50555c] font-normal mt-3">to go live after review</span>
              </div>

              <div className="bg-[#061923] rounded-[20px] p-7 flex flex-col gap-2">
                <span className="text-[16px] font-medium text-white">What you’ll need</span>
                <p className="text-[14px] text-white/70 leading-relaxed">
                  Venue photos, court count, operating hours, hourly price, and bank details for instant payouts.
                </p>
              </div>
            </div>

            {/* Right Form Card (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-[#e3e5e8] rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 flex flex-col gap-6 shadow-[0_18px_45px_rgb(4_38_68_/_0.07)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[24px] sm:text-[28px] font-normal tracking-tight text-black">
                  Tell us about your venue
                </h2>
                <span className="bg-[#FEF7E6] px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-[#92400E]">
                  Step 1 of 3
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#e3e5e8] h-2 rounded-full overflow-hidden">
                <div className="bg-[#F59E0B] h-full w-1/3 rounded-full" />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 rounded-[12px] p-3.5 text-[14px]">
                  {error}
                </div>
              )}

              {/* Venue details */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-black mb-1.5">
                    Venue Name *
                  </label>
                  <input
                    className={cn(inputClass, fieldErrors.businessName && errorClass)}
                    placeholder="e.g. Surat Cricket Arena"
                    value={formData.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                  />
                  {fieldErrors.businessName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.businessName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-black mb-1.5">Area *</label>
                    <select
                      className={inputClass}
                      value={formData.city}
                      onChange={(e) => update('city', e.target.value)}
                    >
                      <option value="Varachha">Varachha, Surat</option>
                      <option value="Vesu">Vesu, Surat</option>
                      <option value="Adajan">Adajan, Surat</option>
                      <option value="Katargam">Katargam, Surat</option>
                      <option value="Pal">Pal, Surat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-black mb-1.5">
                      Number of Courts
                    </label>
                    <select
                      className={inputClass}
                      value={formData.numberOfVenues}
                      onChange={(e) => update('numberOfVenues', Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'court' : 'courts'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black mb-1.5">
                    Full Address *
                  </label>
                  <textarea
                    rows={2}
                    className={cn(inputClass, 'resize-none', fieldErrors.businessAddress && errorClass)}
                    placeholder="Ground / Box address in Surat"
                    value={formData.businessAddress}
                    onChange={(e) => update('businessAddress', e.target.value)}
                  />
                  {fieldErrors.businessAddress && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.businessAddress}</p>
                  )}
                </div>
              </div>

              {/* Owner / Contact Info */}
              <div className="pt-4 border-t border-[#e3e5e8]/80 flex flex-col gap-4">
                <h3 className="text-[17px] font-medium text-black">Contact & Account</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-black mb-1.5">
                      Owner Name *
                    </label>
                    <input
                      className={cn(inputClass, fieldErrors.ownerName && errorClass)}
                      placeholder="Your full name"
                      value={formData.ownerName}
                      onChange={(e) => update('ownerName', e.target.value)}
                    />
                    {fieldErrors.ownerName && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.ownerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-black mb-1.5">
                      Mobile Number *
                    </label>
                    <div className="flex">
                      <span className="bg-[#eef1f4] border border-[#e3e5e8] border-r-0 rounded-l-[12px] px-3.5 flex items-center text-[14px] text-black font-medium shrink-0">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        className={cn(inputClass, 'rounded-l-none', fieldErrors.mobile && errorClass)}
                        placeholder="9876543210"
                        value={formData.mobile}
                        onChange={(e) => update('mobile', e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    {fieldErrors.mobile && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-black mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className={cn(inputClass, fieldErrors.email && errorClass)}
                      placeholder="owner@cricbooking.com"
                      value={formData.email}
                      readOnly={signedIn}
                      onChange={(e) => update('email', e.target.value)}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {signedIn ? (
                    <div className="sm:col-span-2 rounded-2xl bg-[#f4f6f8] px-4 py-3 text-[13px] text-[#404449]">
                      You&apos;re applying with your current account, <span className="font-medium text-black">{user?.email}</span>.
                      You&apos;ll log in to the owner dashboard with this email once approved.{' '}
                      <button type="button" onClick={() => signOut('/list-venue')} className="font-medium text-black underline underline-offset-2">
                        Use a different account
                      </button>
                    </div>
                  ) : (
                    <>
                  <div>
                    <label className="block text-[13px] font-medium text-black mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={cn(inputClass, 'pr-10', fieldErrors.password && errorClass)}
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={(e) => update('password', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#767b82] hover:text-black"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[13px] font-medium text-black mb-1.5">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className={cn(inputClass, fieldErrors.confirmPassword && errorClass)}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                    </>
                  )}
                </div>
              </div>

              {/* Documents & Bank */}
              <div className="pt-4 border-t border-[#e3e5e8]/80 flex flex-col gap-4">
                <h3 className="text-[17px] font-medium text-black">Verification & Payouts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileUploadZone
                    label="Upload Aadhaar / PAN / Owner ID"
                    file={formData.identityDoc}
                    onSelect={(f) => update('identityDoc', f)}
                    onRemove={() => update('identityDoc', null)}
                  />
                  <FileUploadZone
                    label="Upload Turf Registration / License"
                    file={formData.businessDoc}
                    onSelect={(f) => update('businessDoc', f)}
                    onRemove={() => update('businessDoc', null)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-[13px] font-medium text-black mb-1.5">
                      UPI ID (for daily payouts)
                    </label>
                    <input
                      className={inputClass}
                      placeholder="e.g. turf@upi"
                      value={formData.upiId}
                      onChange={(e) => update('upiId', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-black mb-1.5">
                      Pincode *
                    </label>
                    <input
                      className={cn(inputClass, fieldErrors.pincode && errorClass)}
                      placeholder="395006"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => update('pincode', e.target.value.replace(/\D/g, ''))}
                    />
                    {fieldErrors.pincode && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms Checkbox & Submit */}
              <div className="pt-4 border-t border-[#e3e5e8]/80 flex flex-col gap-4">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => update('agreedToTerms', e.target.checked)}
                    className="mt-1 size-4 rounded border-[#e3e5e8] accent-black cursor-pointer"
                  />
                  <span className="text-[13px] text-[#50555c]">
                    I confirm that I am authorized to list this turf. I agree to CricBooking’s terms of service and commission policy.
                  </span>
                </label>
                {fieldErrors.agreedToTerms && (
                  <p className="text-xs text-red-500">{fieldErrors.agreedToTerms}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group mt-2 w-full bg-[#F59E0B] hover:bg-[#D97706] transition-all text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium inline-flex items-center justify-between disabled:opacity-50"
                >
                  <span>{loading ? 'Submitting venue...' : 'Submit venue for review'}</span>
                  <span className="size-8 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
