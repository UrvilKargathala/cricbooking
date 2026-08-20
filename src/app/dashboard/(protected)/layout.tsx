'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MapPin, Calendar, Clock, Menu, Bell, Settings, LogOut, ChevronLeft, HelpCircle } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { fetchOwnerBookings } from '@/lib/supabase-queries'
import { useAuth } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/Toaster'
import type { Booking } from '@/types'

function initials(name: string) {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'O'
}

const MAIN_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/venues', icon: MapPin, label: 'My Venues' },
  { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/dashboard/slots', icon: Clock, label: 'Slot Management' },
]

const SETTINGS_NAV = [
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [pendingPayments, setPendingPayments] = useState<Booking[]>([])

  useEffect(() => {
    const supabase = createClient()
    const channelName = `layout-bookings-${Date.now()}`
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (cancelled || !authUser) return
      const bookings = await fetchOwnerBookings(authUser.id)
      if (cancelled) return
      setPendingPayments(bookings.filter((b) => b.payment_status === 'pending' && b.status !== 'cancelled'))

      channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async () => {
          if (cancelled) return
          const fresh = await fetchOwnerBookings(authUser.id)
          if (!cancelled) setPendingPayments(fresh.filter((b) => b.payment_status === 'pending' && b.status !== 'cancelled'))
        })
        .subscribe()
    }
    load()

    return () => { cancelled = true; if (channel) supabase.removeChannel(channel) }
  }, [])

  const displayName = user?.full_name || 'Venue Owner'
  const displayEmail = user?.email || ''

  const allNav = [...MAIN_NAV, ...SETTINGS_NAV]

  const renderNavItem = (item: typeof MAIN_NAV[0]) => {
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        title={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
          isActive ? 'bg-brand-50 text-brand-700' : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50',
          collapsed && 'justify-center px-2'
        )}
      >
        <item.icon className={cn('w-[18px] h-[18px] shrink-0', isActive ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600')} />
        {!collapsed && item.label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen flex dashboard-theme">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-surface-200 flex flex-col transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Header with logo and collapse toggle */}
        <div className="h-16 border-b border-surface-200 px-3 flex items-center justify-between shrink-0">
          <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center w-full')}>
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!collapsed && <span className="font-display font-bold text-lg text-surface-900">CricBooking</span>}
          </div>
          <button
            onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); else setCollapsed((v) => !v) }}
            className={cn('text-surface-400 hover:text-surface-700 transition-colors', collapsed && 'hidden')}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-3 space-y-1">
            {!collapsed && (
              <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Main</p>
            )}
            {MAIN_NAV.map(renderNavItem)}
          </nav>

          <nav className="px-3 pb-3 space-y-1">
            {!collapsed && (
              <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Settings</p>
            )}
            {SETTINGS_NAV.map(renderNavItem)}
          </nav>
        </div>

        {/* Bottom section — always visible */}
        <div className="shrink-0 border-t border-surface-200">
          <div className={cn('px-3 pt-2', collapsed && 'px-2')}>
            <Link
              href="/dashboard/settings"
              title={collapsed ? 'Help' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:text-surface-900 hover:bg-surface-50 transition-all',
                collapsed && 'justify-center px-2'
              )}
            >
              <HelpCircle className="w-[18px] h-[18px] shrink-0 text-surface-400" />
              {!collapsed && 'Help'}
            </Link>
          </div>

          <div className={cn('px-3 pb-4', collapsed && 'px-2 pb-3')}>
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer',
              collapsed && 'justify-center px-0'
            )}>
              <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {initials(displayName)}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-surface-900 truncate">{displayName}</p>
                  <p className="text-xs text-surface-400 truncate" title={displayEmail}>{displayEmail}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Collapsed state: show expand button */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex fixed left-[60px] top-5 z-50 w-6 h-6 bg-white border border-surface-200 rounded-full items-center justify-center text-surface-400 hover:text-surface-700 shadow-sm transition-colors"
          title="Expand sidebar"
        >
          <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-surface-200 h-16 flex items-center px-4 sm:px-6 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-surface-800">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-surface-900 flex-1">
            {allNav.find((item) => pathname === item.href)?.label ?? 'Dashboard'}
          </h1>

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
