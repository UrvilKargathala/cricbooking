'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

const NOTIFICATION_PREFS = [
  { key: 'email', label: 'Email notifications', description: 'Booking confirmations and daily summaries.' },
  { key: 'sms', label: 'SMS alerts for new bookings', description: 'Get a text the moment a slot is booked.' },
  { key: 'payment', label: 'Payment reminders', description: 'Nudge when a booking has a pending payment.' },
]

export default function DashboardSettingsPage() {
  const { user, signOut } = useAuth()
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ email: true, sms: true, payment: false })

  const togglePref = (key: string) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleLogout = () => {
    if (confirm('Log out of the Owner Dashboard?')) signOut()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-xl text-surface-900 mb-6">Settings</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          alert('Profile changes saved! (demo mode — backend wiring coming later)')
        }}
        className="bg-white rounded-xl border border-surface-200 p-5 flex flex-col gap-4"
      >
        <h2 className="font-display font-semibold text-surface-900">Profile</h2>
        <Input label="Full Name" defaultValue={user?.full_name || ''} required />
        <Input label="Email" type="email" defaultValue={user?.email || ''} required />
        <div>
          <label className="block text-sm font-medium text-surface-800 mb-1.5">Phone Number</label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-surface-100 border border-surface-200 rounded-lg text-sm text-surface-800">
              +91
            </span>
            <Input type="tel" defaultValue="98250 12345" maxLength={10} className="flex-1" required />
          </div>
        </div>
        <Button type="submit" variant="primary" className="self-start">
          Save Changes
        </Button>
      </form>

      <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
        <h2 className="font-display font-semibold text-surface-900 mb-1">Notifications</h2>
        <p className="text-sm text-surface-800/50 mb-4">Choose how you want to hear about activity on your venues.</p>

        <div className="flex flex-col gap-4">
          {NOTIFICATION_PREFS.map((pref) => (
            <div key={pref.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-surface-900">{pref.label}</p>
                <p className="text-xs text-surface-800/50 mt-0.5">{pref.description}</p>
              </div>
              <button
                onClick={() => togglePref(pref.key)}
                className={cn('w-9 h-5 rounded-full transition-colors relative shrink-0', prefs[pref.key] ? 'bg-brand-600' : 'bg-surface-200')}
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform',
                    prefs[pref.key] ? 'translate-x-4' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-5 mt-6">
        <h2 className="font-display font-semibold text-surface-900 mb-1">Account</h2>
        <p className="text-sm text-surface-800/50 mb-4">Sign out of the Owner Dashboard on this device.</p>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-1.5 !text-red-600 !border-red-200 hover:!bg-red-50">
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    </div>
  )
}
