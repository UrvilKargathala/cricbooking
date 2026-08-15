'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MapPin, Calendar, Clock, Menu, X, Bell, Settings, LogOut } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { DEMO_OWNER_BOOKINGS } from '@/lib/demo-data'
import { useAuth } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/Toaster'

function initials(name: string) {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'O'
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/venues', icon: MapPin, label: 'My Venues' },
  { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/dashboard/slots', icon: Clock, label: 'Slot Management' },
]

const pendingPayments = DEMO_OWNER_BOOKINGS.filter((b) => b.payment_status === 'pending' && b.status !== 'cancelled')

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const displayName = user?.full_name || 'Venue Owner'
  const displayEmail = user?.email || ''

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-surface-900 border-r border-white/5 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 border-b border-white/10 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-sm shadow-brand-900/40">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-display font-bold text-lg text-white">Owner Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-brand-600 text-white shadow-sm shadow-brand-900/30' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                )}
              >
                <span
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isActive ? 'bg-white/15' : 'bg-white/5'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-medium text-white shrink-0">
              {initials(displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-white/40 truncate">{displayEmail}</p>
            </div>
            <button
              onClick={signOut}
              className="text-xs text-white/40 hover:text-white transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-surface-200 h-16 flex items-center px-4 sm:px-6 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-surface-800">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-surface-900 flex-1">Dashboard</h1>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((open) => !open)}
              className="relative text-surface-800/70 hover:text-surface-900 p-2 rounded-lg hover:bg-surface-100"
            >
              <Bell className="w-5 h-5" />
              {pendingPayments.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {pendingPayments.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-surface-200 shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-100">
                    <p className="font-display font-semibold text-sm text-surface-900">Notifications</p>
                  </div>
                  {pendingPayments.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-surface-800/50 text-center">You&apos;re all caught up</p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-surface-100">
                      {pendingPayments.map((booking) => (
                        <Link
                          key={booking.id}
                          href="/dashboard/bookings"
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-surface-50"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-surface-900">
                              {booking.user?.full_name || booking.customer_name} — payment pending
                            </p>
                            <p className="text-xs text-surface-800/50 mt-0.5">
                              {formatPrice(booking.amount)} · {booking.court?.name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center text-sm font-medium text-white hover:opacity-90"
            >
              {initials(displayName)}
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-surface-200 shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-100">
                    <p className="text-sm font-medium text-surface-900 truncate">{displayName}</p>
                    <p className="text-xs text-surface-800/50 truncate">{displayEmail}</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-800 hover:bg-surface-50"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      signOut()
                    }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
