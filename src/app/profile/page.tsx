'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import { useToastStore } from '@/store/useToastStore'
import type { Profile } from '@/types'

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/profile'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '', area: data.area || '' })
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
      showToast('Profile updated', 'success')
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-surface-800/60 hover:text-surface-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="font-display font-bold text-2xl text-surface-900 mb-8">My Account</h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-surface-200">
              <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 font-bold text-xl flex items-center justify-center shrink-0">
                {(profile.full_name?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <p className="font-display font-semibold text-lg text-surface-900">{profile.full_name}</p>
                <p className="text-sm text-surface-800/50">{profile.email}</p>
                <p className="text-xs text-surface-800/40 mt-0.5">
                  Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-4">
              <h2 className="font-display font-semibold text-surface-900">Personal Details</h2>

              <Input
                id="name"
                label="Full Name"
                icon={<User className="w-4 h-4" />}
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              />

              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Email</label>
                <div className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-800/60 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-surface-800/40" />
                  {profile.email}
                </div>
                <p className="text-xs text-surface-800/40 mt-1">Email cannot be changed</p>
              </div>

              <Input
                id="phone"
                label="Phone Number"
                icon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />

              <Input
                id="area"
                label="Area (Locality)"
                icon={<MapPin className="w-4 h-4" />}
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                placeholder="e.g. Vesu, Adajan"
              />
            </div>

            <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  )
}
