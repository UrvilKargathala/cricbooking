'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Check, Eye, EyeOff, Phone, Building2, FileText, Landmark } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-surface-800/40'
const errorClass = 'border-red-300 focus:ring-red-400'

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mt-8 mb-4 pb-2 border-b border-surface-200">
      <Icon className="w-4 h-4 text-brand-600" />
      <h3 className="font-display font-semibold text-base text-surface-900">{title}</h3>
    </div>
  )
}

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
        <div className="flex items-center gap-3 bg-surface-50 border border-surface-200 rounded-lg p-3">
          <FileText className="w-5 h-5 text-brand-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-surface-900 truncate">{file.name}</p>
            <p className="text-xs text-surface-800/40">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={onRemove} className="text-surface-800/40 hover:text-red-600 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={cn(
            'w-full border border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors',
            error ? 'border-red-300' : 'border-surface-200'
          )}
        >
          <Upload className="w-6 h-6 text-surface-800/30 mx-auto" />
          <p className="text-sm text-surface-800/60 mt-1.5">{label}</p>
          <p className="text-xs text-surface-800/40 mt-0.5">JPG, PNG, PDF — max 5MB</p>
        </button>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
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
    if (formData.password.length < 8) errs.password = 'Minimum 8 characters'
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

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.ownerName } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const userId = authData.user!.id

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

    const { error: appError } = await supabase.from('owner_applications').insert({
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
      basic_turf_info: formData.basicTurfInfo || null,
      identity_document: identityDocUrl,
      business_document: businessDocUrl,
      bank_name: formData.bankName || null,
      account_holder: formData.accountHolder || null,
      account_number: formData.accountNumber || null,
      ifsc_code: formData.ifscCode || null,
      upi_id: formData.upiId || null,
    })

    if (appError) {
      setError(appError.message)
      setLoading(false)
      return
    }

    await supabase.from('profiles').update({
      full_name: formData.ownerName,
      phone: '+91' + formData.mobile,
    }).eq('id', userId)

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display font-bold text-3xl sm:text-4xl">Partner With CricBooking</h1>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">
              Register your turf business and start receiving online bookings from players across Surat.
            </p>
          </div>
        </section>

        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          {submitted ? (
            <div className="bg-white rounded-xl border border-surface-200 p-8 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-display font-bold text-xl text-surface-900 mt-4">Application Submitted!</h2>
              <p className="text-surface-800/70 mt-2">
                Thank you, {formData.ownerName}! Your application for {formData.businessName} has been submitted successfully.
              </p>
              <p className="text-sm text-surface-800/50 mt-1">
                Our team will review your details and get back to you within 48 hours.
              </p>
              <div className="bg-surface-50 rounded-lg p-4 mt-6 text-left text-sm text-surface-800/60">
                <p className="font-medium text-surface-900 mb-2">What happens next?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>We review your documents and business details</li>
                  <li>You&apos;ll receive an email once approved</li>
                  <li>Login to your Owner Dashboard and add your venues</li>
                </ol>
              </div>
              <Button variant="secondary" className="mt-6" onClick={() => router.push('/')}>
                Go to Homepage
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-surface-200 p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-surface-900">Register as a Venue Owner</h2>
              <p className="text-sm text-surface-800/60 mt-1">
                Fill in your details. We&apos;ll review your application within 48 hours.
              </p>

              {error && (
                <div className="bg-red-50 text-red-800 rounded-lg p-3 text-sm mt-4">{error}</div>
              )}

              {/* Section 1: Personal Information */}
              <SectionHeading icon={Phone} title="Personal Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Owner Name *</label>
                  <input
                    className={cn(inputClass, fieldErrors.ownerName && errorClass)}
                    placeholder="Full name"
                    value={formData.ownerName}
                    onChange={(e) => update('ownerName', e.target.value)}
                  />
                  {fieldErrors.ownerName && <p className="text-xs text-red-600 mt-1">{fieldErrors.ownerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Mobile Number *</label>
                  <div className="flex">
                    <span className="bg-surface-200 border border-surface-200 rounded-l-lg px-3 flex items-center text-sm text-surface-800/60 shrink-0">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      className={cn(inputClass, 'rounded-l-none', fieldErrors.mobile && errorClass)}
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={(e) => update('mobile', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  {fieldErrors.mobile && <p className="text-xs text-red-600 mt-1">{fieldErrors.mobile}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    className={cn(inputClass, fieldErrors.email && errorClass)}
                    placeholder="owner@email.com"
                    value={formData.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                  <p className="text-xs text-surface-800/40 mt-1">This will be your login email</p>
                  {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={cn(inputClass, 'pr-10', fieldErrors.password && errorClass)}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => update('password', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-800/40 hover:text-surface-800"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-surface-800/40 mt-1">Minimum 8 characters</p>
                  {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
                </div>
              </div>

              {/* Section 2: Business Details */}
              <SectionHeading icon={Building2} title="Business Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Business / Turf Name *</label>
                  <input
                    className={cn(inputClass, fieldErrors.businessName && errorClass)}
                    placeholder="e.g. Surat Cricket Arena"
                    value={formData.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                  />
                  {fieldErrors.businessName && <p className="text-xs text-red-600 mt-1">{fieldErrors.businessName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Business Address *</label>
                  <textarea
                    rows={2}
                    className={cn(inputClass, 'resize-none', fieldErrors.businessAddress && errorClass)}
                    placeholder="Full address of your turf/ground"
                    value={formData.businessAddress}
                    onChange={(e) => update('businessAddress', e.target.value)}
                  />
                  {fieldErrors.businessAddress && <p className="text-xs text-red-600 mt-1">{fieldErrors.businessAddress}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">City</label>
                  <input
                    className={inputClass}
                    value={formData.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">State</label>
                  <input
                    className={inputClass}
                    value={formData.state}
                    onChange={(e) => update('state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Pincode *</label>
                  <input
                    className={cn(inputClass, fieldErrors.pincode && errorClass)}
                    placeholder="395007"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => update('pincode', e.target.value.replace(/\D/g, ''))}
                  />
                  {fieldErrors.pincode && <p className="text-xs text-red-600 mt-1">{fieldErrors.pincode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Number of Venues</label>
                  <select
                    className={inputClass}
                    value={formData.numberOfVenues}
                    onChange={(e) => update('numberOfVenues', Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n === 5 ? '5+' : n}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Basic Turf Information</label>
                  <textarea
                    rows={3}
                    className={cn(inputClass, 'resize-none')}
                    placeholder="Tell us about your turf — surface type, size, sports offered, facilities available..."
                    value={formData.basicTurfInfo}
                    onChange={(e) => update('basicTurfInfo', e.target.value)}
                  />
                </div>
              </div>

              {/* Section 3: Documents */}
              <SectionHeading icon={FileText} title="Verification Documents" />
              <div className="bg-amber-50 text-amber-800 rounded-lg p-3 text-sm mb-4">
                Upload clear photos or scanned copies. Accepted formats: JPG, PNG, PDF (max 5MB each).
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUploadZone
                  label="Click to upload Aadhaar, PAN or Voter ID"
                  file={formData.identityDoc}
                  onSelect={(f) => update('identityDoc', f)}
                  onRemove={() => update('identityDoc', null)}
                />
                <FileUploadZone
                  label="Click to upload GST Certificate or Business Registration"
                  file={formData.businessDoc}
                  onSelect={(f) => update('businessDoc', f)}
                  onRemove={() => update('businessDoc', null)}
                />
              </div>

              {/* Section 4: Bank / Payment Details */}
              <SectionHeading icon={Landmark} title="Payment Details" />
              <div className="bg-blue-50 text-blue-800 rounded-lg p-3 text-sm mb-4">
                Required for receiving booking payments. You can update this later from your dashboard.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Bank Name</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. State Bank of India"
                    value={formData.bankName}
                    onChange={(e) => update('bankName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Account Holder Name</label>
                  <input
                    className={inputClass}
                    placeholder="Name as per bank account"
                    value={formData.accountHolder}
                    onChange={(e) => update('accountHolder', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">Account Number</label>
                  <input
                    className={inputClass}
                    placeholder="Account number"
                    value={formData.accountNumber}
                    onChange={(e) => update('accountNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">IFSC Code</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. SBIN0001234"
                    value={formData.ifscCode}
                    onChange={(e) => update('ifscCode', e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-800 mb-1.5">UPI ID</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. owner@upi"
                    value={formData.upiId}
                    onChange={(e) => update('upiId', e.target.value)}
                  />
                  <p className="text-xs text-surface-800/40 mt-1">Optional — for faster payouts</p>
                </div>
              </div>

              {/* Terms & Submit */}
              <div className="mt-8">
                <label className={cn('flex items-start gap-2 cursor-pointer', fieldErrors.agreedToTerms && 'text-red-600')}>
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => update('agreedToTerms', e.target.checked)}
                    className="mt-1 rounded border-surface-300 text-brand-600 focus:ring-brand-400"
                  />
                  <span className="text-sm text-surface-800/70">
                    I confirm that all information provided is accurate. I agree to CricBooking&apos;s terms of service and platform guidelines.
                  </span>
                </label>
                {fieldErrors.agreedToTerms && <p className="text-xs text-red-600 mt-1">{fieldErrors.agreedToTerms}</p>}
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
