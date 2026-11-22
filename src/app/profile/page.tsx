'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'
import { useToastStore } from '@/store/useToastStore'
import type { Profile } from '@/types'

const inputClass =
  'w-full px-4 py-3 bg-white border border-[#e3e5e8] rounded-[12px] text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent placeholder:text-[#767b82] transition-all'

export default function ProfilePage() {
  const router = useRouter()
  const showToast = useToastStore((s) => s.showToast)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', area: '' })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/profile')
        return
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          area: data.area || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async () => {
    if (!profile || !form.full_name.trim()) {
      showToast('Name is required', 'error')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        area: form.area.trim() || null,
      })
      .eq('id', profile.id)
    setSaving(false)
    if (error) {
      showToast('Failed to update profile', 'error')
    } else {
      showToast('Profile updated successfully', 'success')
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.slice(0, 2).toUpperCase()
    : profile?.email
    ? profile.email.slice(0, 2).toUpperCase()
    : 'CB'

  return (
    <div className="min-h-screen bg-white text-black font-['Geist'] flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-[680px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[14px] text-[#50555c] hover:text-black mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to home</span>
        </Link>

        <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-black mb-6">
          Profile & Settings
        </h1>

        {loading ? (
          <div className="bg-[#f4f6f8] rounded-[24px] p-12 text-center">
            <div className="size-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[14px] text-[#50555c] mt-4">Loading account details...</p>
          </div>
        ) : profile ? (
          <div className="flex flex-col gap-6">
            {/* User Profile Header Card */}
            <div className="bg-[#f4f6f8] rounded-[24px] p-6 sm:p-7 flex items-center gap-4">
              <span className="size-16 rounded-full bg-[#F59E0B] text-black font-semibold text-xl flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                {initials}
              </span>
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-medium text-black">
                  {profile.full_name || 'CricBooking Player'}
                </h2>
                <p className="text-[14px] text-[#50555c]">{profile.email}</p>
                <p className="text-[12px] text-[#6c6c6c] mt-0.5">
                  Member since{' '}
                  {new Date(profile.created_at).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-[#f4f6f8] rounded-[24px] p-6 sm:p-8 flex flex-col gap-5">
              <h3 className="text-[18px] font-medium text-black">Personal Information</h3>

              <div>
                <label htmlFor="name" className="block text-[13px] font-medium text-black mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-black mb-1.5">
                  Email Address
                </label>
                <input
                  value={profile.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-[#eef1f4] border border-[#e3e5e8] rounded-[12px] text-[15px] text-[#767b82] cursor-not-allowed select-none"
                />
                <p className="text-[12px] text-[#6c6c6c] mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-[13px] font-medium text-black mb-1.5">
                  Phone Number
                </label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-[13px] font-medium text-black mb-1.5">
                  Favorite Area in Surat
                </label>
                <input
                  id="area"
                  value={form.area}
                  onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                  placeholder="e.g. Vesu, Adajan, Varachha"
                  className={inputClass}
                />
              </div>

              <div className="pt-3 border-t border-[#e3e5e8]">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="group w-full bg-[#F59E0B] hover:bg-[#D97706] transition-colors text-black pl-6 pr-2 py-3 rounded-full text-[15px] font-medium inline-flex items-center justify-between disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <Save className="size-4" />
                    <span>{saving ? 'Saving changes...' : 'Save changes'}</span>
                  </span>
                  <span className="size-8 rounded-full bg-black text-[#FBBF24] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-4" strokeWidth={2.5} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
