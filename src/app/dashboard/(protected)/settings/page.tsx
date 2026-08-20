'use client'

import { useState } from 'react'
import {
  LogOut, User, Bell, Shield, Camera, Phone, Mail,
  Globe, Clock, ChevronRight, Check, Moon, Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useToastStore } from '@/store/useToastStore'

type Tab = 'profile' | 'notifications' | 'account'

const TABS: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'account', label: 'Account', icon: Shield },
]

const NOTIFICATION_GROUPS = [
  {
    title: 'Bookings',
    items: [
      { key: 'new_booking', label: 'New booking received', description: 'When a player books a slot at your venue', default: true },
      { key: 'booking_cancelled', label: 'Booking cancelled', description: 'When a player cancels their booking', default: true },
      { key: 'booking_modified', label: 'Booking modified', description: 'When a player changes their booking time', default: false },
    ],
  },
  {
    title: 'Payments',
    items: [
      { key: 'payment_received', label: 'Payment received', description: 'When a payment is successfully processed', default: true },
      { key: 'payment_pending', label: 'Payment reminder', description: 'Nudge when a booking has pending payment', default: true },
      { key: 'payout_complete', label: 'Payout completed', description: 'When your earnings are deposited', default: false },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { key: 'reviews', label: 'New reviews', description: 'When a player leaves a review on your venue', default: true },
      { key: 'tips', label: 'Tips & insights', description: 'Weekly tips to improve your venue listing', default: false },
    ],
  },
]

function initials(name: string) {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'O'
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-11 h-6 rounded-full transition-colors relative shrink-0',
        on ? 'bg-brand-600' : 'bg-surface-300'
      )}
    >
      <span
        className={cn(
          'w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform',
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

function SettingRow({
  icon: Icon,
  label,
  value,
  onClick,
  danger,
}: {
  icon: typeof User
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors',
        danger ? 'hover:bg-red-50' : 'hover:bg-surface-50'
      )}
    >
      <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', danger ? 'bg-red-100' : 'bg-surface-100')}>
        <Icon className={cn('w-4 h-4', danger ? 'text-red-600' : 'text-surface-600')} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn('text-sm font-medium block', danger ? 'text-red-600' : 'text-surface-900')}>{label}</span>
        {value && <span className="text-xs text-surface-500 block truncate mt-0.5">{value}</span>}
      </span>
      {!danger && <ChevronRight className="w-4 h-4 text-surface-400 shrink-0" />}
    </button>
  )
}

export default function DashboardSettingsPage() {
  const { user, signOut } = useAuth()
  const showToast = useToastStore((s) => s.showToast)
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [editingProfile, setEditingProfile] = useState(false)
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cb_notification_prefs')
      if (saved) try { return JSON.parse(saved) } catch {}
    }
    const defaults: Record<string, boolean> = {}
    NOTIFICATION_GROUPS.forEach((g) => g.items.forEach((i) => { defaults[i.key] = i.default }))
    return defaults
  })
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('cb_theme') as 'light' | 'dark' | 'system') || 'system'
    return 'system'
  })

  const displayName = user?.full_name || 'Venue Owner'
  const displayEmail = user?.email || ''

  const togglePref = (key: string) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-brand-600/20">
            {initials(displayName)}
          </div>
          <button className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
            <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-surface-900">{displayName}</h1>
          <p className="text-sm text-surface-500">{displayEmail}</p>
        </div>
        <span className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
          Venue Owner
        </span>
      </div>

      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          {!editingProfile ? (
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-surface-100 flex items-center justify-between">
                <h2 className="font-display font-semibold text-surface-900">Personal Information</h2>
                <Button variant="ghost" size="sm" onClick={() => setEditingProfile(true)}>
                  Edit
                </Button>
              </div>
              <div className="divide-y divide-surface-100">
                <SettingRow icon={User} label="Full Name" value={displayName} onClick={() => setEditingProfile(true)} />
                <SettingRow icon={Mail} label="Email" value={displayEmail} onClick={() => setEditingProfile(true)} />
                <SettingRow icon={Phone} label="Phone" value={user?.phone || 'Not set'} onClick={() => setEditingProfile(true)} />
                <SettingRow icon={Globe} label="City" value={user?.city || 'Not set'} onClick={() => setEditingProfile(true)} />
              </div>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget
                const fullName = (form.elements.namedItem('full_name') as HTMLInputElement).value
                const phone = (form.elements.namedItem('phone') as HTMLInputElement).value
                const city = (form.elements.namedItem('city') as HTMLInputElement).value
                if (!user) return
                const supabase = createClient()
                const { error } = await supabase
                  .from('profiles')
                  .update({ full_name: fullName, phone: phone ? `+91${phone}` : null, city })
                  .eq('id', user.id)
                if (error) {
                  showToast(`Error: ${error.message}`, 'error')
                  return
                }
                setEditingProfile(false)
                showToast('Profile updated successfully.', 'success')
              }}
              className="bg-white rounded-xl border border-surface-200 p-5 space-y-4"
            >
              <h2 className="font-display font-semibold text-surface-900">Edit Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input name="full_name" label="Full Name" defaultValue={user?.full_name || ''} required />
                <Input label="Email" type="email" defaultValue={displayEmail} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1.5">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-surface-100 border border-surface-200 rounded-lg text-sm text-surface-600 font-medium">
                    +91
                  </span>
                  <Input name="phone" type="tel" defaultValue={user?.phone?.replace('+91', '') || ''} maxLength={10} className="flex-1" required />
                </div>
              </div>
              <Input name="city" label="City" defaultValue={user?.city || ''} />
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary">Save Changes</Button>
                <Button type="button" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-100">
              <h2 className="font-display font-semibold text-surface-900">Preferences</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-surface-800 mb-2.5">Appearance</p>
                <div className="flex gap-2">
                  {([
                    { key: 'light' as const, icon: Sun, label: 'Light' },
                    { key: 'dark' as const, icon: Moon, label: 'Dark' },
                    { key: 'system' as const, icon: Globe, label: 'System' },
                  ]).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setTheme(opt.key); localStorage.setItem('cb_theme', opt.key) }}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                        theme === opt.key
                          ? 'bg-brand-50 border-brand-200 text-brand-700'
                          : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300'
                      )}
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                      {theme === opt.key && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-800">Time zone</p>
                  <p className="text-xs text-surface-500 mt-0.5">Used for slot times and booking confirmations</p>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-surface-600 bg-surface-100 px-3 py-1.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  IST (UTC+5:30)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-100 flex items-center justify-between">
              <h2 className="font-display font-semibold text-surface-900">Notification Channels</h2>
            </div>
            <div className="divide-y divide-surface-100">
              {[
                { key: 'email_channel', icon: Mail, label: 'Email', description: 'Receive notifications via email', default: true },
                { key: 'sms_channel', icon: Phone, label: 'SMS', description: 'Receive SMS alerts for urgent updates', default: true },
              ].map((channel) => (
                <div key={channel.key} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center">
                      <channel.icon className="w-4 h-4 text-surface-600" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{channel.label}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{channel.description}</p>
                    </div>
                  </div>
                  <Toggle
                    on={prefs[channel.key] ?? channel.default}
                    onToggle={() => togglePref(channel.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {NOTIFICATION_GROUPS.map((group) => (
            <div key={group.title} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-surface-100">
                <h2 className="font-display font-semibold text-sm text-surface-900">{group.title}</h2>
              </div>
              <div className="divide-y divide-surface-100">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900">{item.label}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{item.description}</p>
                    </div>
                    <Toggle on={prefs[item.key] ?? false} onToggle={() => togglePref(item.key)} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => { localStorage.setItem('cb_notification_prefs', JSON.stringify(prefs)); showToast('Notification preferences saved.', 'success') }}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-100">
              <h2 className="font-display font-semibold text-surface-900">Security</h2>
            </div>
            <div className="divide-y divide-surface-100">
              <SettingRow
                icon={Shield}
                label="Change Password"
                value="Send a password reset link to your email"
                onClick={async () => {
                  if (!user?.email) return
                  const supabase = createClient()
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email)
                  if (error) showToast(`Error: ${error.message}`, 'error')
                  else showToast('Password reset email sent. Check your inbox.', 'success')
                }}
              />
              <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-surface-600" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-surface-900">Two-factor authentication</p>
                    <p className="text-xs text-surface-500 mt-0.5">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Not enabled
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-100">
              <h2 className="font-display font-semibold text-surface-900">Sessions</h2>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900">Current session</p>
                  <p className="text-xs text-surface-500 mt-0.5">macOS · Chrome · Surat, India</p>
                </div>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50/60 rounded-xl border border-red-200/60 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-red-200/40">
              <h2 className="font-display font-semibold text-red-800">Danger Zone</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Log out</p>
                  <p className="text-xs text-red-600/70 mt-0.5">Sign out of the Owner Dashboard on this device</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Log out of the Owner Dashboard?')) signOut()
                  }}
                  className="!text-red-600 !border-red-300 hover:!bg-red-100"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Log Out
                </Button>
              </div>
              <div className="border-t border-red-200/40 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Delete account</p>
                  <p className="text-xs text-red-600/70 mt-0.5">Permanently remove your account and all data</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast('Account deletion not available in demo.', 'info')}
                  className="!text-red-600 !border-red-300 hover:!bg-red-100"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
