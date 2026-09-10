'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, MapPin, User, Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { fetchAreas } from '@/lib/supabase-queries'
import type { Area } from '@/types'

const NAV_LINK_CLASS =
  'relative py-1.5 text-sm font-medium text-surface-800/70 hover:text-brand-600 transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-brand-600 after:transition-all after:duration-200 hover:after:w-full'

function initials(name: string) {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U'
}

export function Header() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [desktopQuery, setDesktopQuery] = useState('')
  const [mobileQuery, setMobileQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [areaOpen, setAreaOpen] = useState(false)
  const [areas, setAreas] = useState<Area[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (menuOpen) mobileSearchRef.current?.focus()
  }, [menuOpen])

  useEffect(() => {
    if (!searchOpen) return
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [searchOpen])

  useEffect(() => {
    if (!profileOpen) return
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [profileOpen])

  useEffect(() => {
    fetchAreas().then(setAreas).catch(() => {})
  }, [])

  useEffect(() => {
    if (!areaOpen) return
    const handleClick = (e: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) {
        setAreaOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAreaOpen(false)
    }
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [areaOpen])

  // Transparent-over-photo only on pages whose hero is a full-bleed image
  // (home, venue detail) — everywhere else the header stays solid.
  const hasPhotoHero = pathname === '/' || (pathname?.startsWith('/venues/') ?? false)
  const transparent = hasPhotoHero && !scrolled && !menuOpen && !searchOpen
  const isActive = (href: string) => pathname === href

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 border-b transition-all duration-200',
        transparent
          ? 'bg-transparent border-transparent shadow-none'
          : 'bg-white/90 backdrop-blur-md shadow-none',
        !transparent && (scrolled ? 'border-transparent shadow-md' : 'border-surface-200')
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link href="/" className="flex md:hidden items-center gap-2">
          <span className={cn('logo-mark w-9 h-9', transparent ? 'text-white' : 'text-brand-600')} />
          <span className="font-display font-bold text-xl">
            <span className={transparent ? 'text-white' : 'text-surface-900'}>Cric</span>
            <span className={transparent ? "text-brand-400" : "text-brand-600"}>Booking</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 justify-self-start">
          <Link
            href="/venues"
            className={cn(
              NAV_LINK_CLASS,
              transparent && 'text-black/80 hover:text-white after:bg-white',
              isActive('/venues') && (transparent ? 'text-white after:w-full' : 'text-brand-600 after:w-full')
            )}
          >
            Venues
          </Link>
          <Link
            href="/how-it-works"
            className={cn(
              NAV_LINK_CLASS,
              transparent && 'text-black/80 hover:text-white after:bg-white',
              isActive('/how-it-works') && (transparent ? 'text-white after:w-full' : 'text-brand-600 after:w-full')
            )}
          >
            How It Works
          </Link>
          <Link
            href="/list-venue"
            className={cn(
              NAV_LINK_CLASS,
              transparent && 'text-black/80 hover:text-white after:bg-white',
              isActive('/list-venue') && (transparent ? 'text-white after:w-full' : 'text-brand-600 after:w-full')
            )}
          >
            List Your Venue
          </Link>
          <Link
            href="/blog"
            className={cn(
              NAV_LINK_CLASS,
              transparent && 'text-black/80 hover:text-white after:bg-white',
              pathname?.startsWith('/blog') && (transparent ? 'text-white after:w-full' : 'text-brand-600 after:w-full')
            )}
          >
            Blog
          </Link>
        </nav>

        <Link href="/" className="hidden md:flex items-center gap-2 justify-self-center">
          <span className={cn('logo-mark w-9 h-9', transparent ? 'text-brand-600' : 'text-brand-600')} />
          <span className="font-display font-bold text-xl">
            <span className={transparent ? 'text-black' : 'text-surface-900'}>Cric</span>
            <span className={transparent ? "text-brand-400" : "text-brand-600"}>Booking</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3 justify-self-end">
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-lg transition-colors',
                searchOpen
                  ? 'bg-brand-50 text-brand-600'
                  : transparent
                    ? 'text-black/80 hover:bg-white/10'
                    : 'text-surface-800/70 hover:bg-surface-100'
              )}
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            {searchOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white border border-surface-200 rounded-lg shadow-lg p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
                  <input
                    autoFocus
                    type="text"
                    value={desktopQuery}
                    onChange={(e) => setDesktopQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && desktopQuery.trim()) {
                        setSearchOpen(false)
                        router.push(`/venues?q=${encodeURIComponent(desktopQuery.trim())}`)
                      }
                    }}
                    placeholder="Search venues, areas..."
                    className="w-full pl-10 pr-3 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
          <span className={cn('w-px h-6', transparent ? 'bg-white/20' : 'bg-surface-200')} />
          <div ref={areaRef} className="relative">
            <button
              onClick={() => setAreaOpen((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 text-sm rounded-lg px-2 py-1.5 -mx-2 transition-colors',
                areaOpen
                  ? 'bg-brand-50 text-brand-600'
                  : transparent
                    ? 'text-black/80 hover:bg-white/10'
                    : 'text-surface-800/70 hover:bg-surface-100'
              )}
            >
              <MapPin className={cn('w-4 h-4', areaOpen ? 'text-brand-600' : transparent ? 'text-brand-400' : 'text-brand-500')} />
              Surat
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', areaOpen && 'rotate-180')} />
            </button>
            {areaOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-12 w-56 bg-white border border-surface-200 rounded-lg shadow-lg p-2 z-50">
                <p className="px-3 pt-1.5 pb-1 text-xs font-medium text-surface-800/40 uppercase tracking-wide">Browse by area</p>
                <Link
                  href="/venues"
                  onClick={() => setAreaOpen(false)}
                  className="block px-3 py-2 text-sm text-surface-800 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  All of Surat
                </Link>
                <div className="max-h-64 overflow-y-auto">
                  {areas.map((area) => (
                    <Link
                      key={area.slug}
                      href={`/venues?area=${area.slug}`}
                      onClick={() => setAreaOpen(false)}
                      className="block px-3 py-2 text-sm text-surface-800 hover:bg-surface-100 rounded-lg transition-colors"
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className={cn('w-px h-6', transparent ? 'bg-white/20' : 'bg-surface-200')} />
          {user?.role === 'user' && (
            <Link href="/bookings">
              <Button
                variant="ghost"
                size="sm"
                className={transparent ? 'text-white hover:bg-white/10' : undefined}
              >
                My Bookings
              </Button>
            </Link>
          )}
          {user && user.role === 'owner' ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Go to Dashboard
              </Button>
            </Link>
          ) : user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-1.5"
              >
                <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm flex items-center justify-center">
                  {initials(user.full_name)}
                </span>
                <ChevronDown className={cn('w-4 h-4', transparent ? 'text-white/80' : 'text-surface-800/60')} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-surface-200 shadow-lg p-2 z-50">
                  <div className="px-3 py-2 border-b border-surface-100 mb-1">
                    <p className="text-sm font-medium text-surface-900 truncate">{user.full_name}</p>
                    <p className="text-xs text-surface-800/50 capitalize">{user.role}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 text-sm text-surface-800 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/bookings"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 text-sm text-surface-800 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 text-sm text-surface-800 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    Wishlist
                  </Link>
                  <div className="border-t border-surface-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        signOut()
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Login
                </span>
              </Button>
            </Link>
          )}
        </div>

        <div className={cn('flex items-center gap-1 md:hidden justify-self-end', transparent && 'text-white')}>
          <button onClick={() => { setMenuOpen(true); setTimeout(() => mobileSearchRef.current?.focus(), 100) }} aria-label="Search venues" className="p-2">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu" className="p-2">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 border-t border-surface-200 bg-white ${
          menuOpen ? 'max-h-[40rem]' : 'max-h-0 border-t-0'
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
            <input
              ref={mobileSearchRef}
              type="text"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && mobileQuery.trim()) {
                  closeMenu()
                  router.push(`/venues?q=${encodeURIComponent(mobileQuery.trim())}`)
                }
              }}
              placeholder="Search venues, areas..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>
          <Link href="/venues" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
            Venues
          </Link>
          <Link href="/how-it-works" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
            How It Works
          </Link>
          <Link href="/list-venue" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
            List Your Venue
          </Link>
          <Link href="/blog" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
            Blog
          </Link>
          {user && user.role === 'owner' ? (
            <Link href="/dashboard" onClick={closeMenu}>
              <Button variant="primary" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          ) : user ? (
            <>
              <div className="flex items-center gap-2.5 py-1.5 border-t border-surface-100 pt-3">
                <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm flex items-center justify-center shrink-0">
                  {initials(user.full_name)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{user.full_name}</p>
                  <p className="text-xs text-surface-800/50 capitalize">{user.role}</p>
                </div>
              </div>
              <Link href="/profile" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
                My Account
              </Link>
              <Link href="/bookings" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
                My Bookings
              </Link>
              <Link href="/wishlist" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
                Wishlist
              </Link>
              <button
                onClick={() => { closeMenu(); signOut() }}
                className="text-sm font-medium text-red-600 py-1.5 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/bookings" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
                My Bookings
              </Link>
              <Link href="/login" onClick={closeMenu}>
                <Button variant="primary" className="w-full">
                  Login / Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
