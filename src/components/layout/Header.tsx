'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, MapPin, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const NAV_LINK_CLASS =
  'relative py-1.5 text-sm font-medium text-surface-800/70 hover:text-brand-600 transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-brand-600 after:transition-all after:duration-200 hover:after:w-full'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const handleHowItWorks = () => {
    closeMenu()
    if (pathname === '/') {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push('/#how-it-works')
    }
  }

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

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b transition-shadow duration-200',
        scrolled ? 'border-transparent shadow-md' : 'border-surface-200 shadow-none'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link href="/" className="flex md:hidden items-center gap-2">
          <span className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg">
            C
          </span>
          <span className="font-display font-bold text-xl">
            <span className="text-surface-900">Cric</span>
            <span className="text-brand-600">Booking</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 justify-self-start">
          <Link
            href="/venues"
            className={cn(NAV_LINK_CLASS, pathname === '/venues' && 'text-brand-600 after:w-full')}
          >
            Venues
          </Link>
          <button onClick={handleHowItWorks} className={NAV_LINK_CLASS}>
            How It Works
          </button>
          <Link
            href="/list-venue"
            className={cn(NAV_LINK_CLASS, pathname === '/list-venue' && 'text-brand-600 after:w-full')}
          >
            List Your Venue
          </Link>
        </nav>

        <Link href="/" className="hidden md:flex items-center gap-2 justify-self-center">
          <span className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg">
            C
          </span>
          <span className="font-display font-bold text-xl">
            <span className="text-surface-900">Cric</span>
            <span className="text-brand-600">Booking</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3 justify-self-end">
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-lg transition-colors',
                searchOpen ? 'bg-brand-50 text-brand-600' : 'text-surface-800/70 hover:bg-surface-100'
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
                    placeholder="Search venues, areas..."
                    className="w-full pl-10 pr-3 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
          <span className="w-px h-6 bg-surface-200" />
          <span className="flex items-center gap-1.5 text-sm text-surface-800/70">
            <MapPin className="w-4 h-4 text-brand-500" />
            Surat
          </span>
          <span className="w-px h-6 bg-surface-200" />
          <Link href="/bookings">
            <Button variant="ghost" size="sm">My Bookings</Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Login
              </span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden justify-self-end">
          <button onClick={() => setMenuOpen(true)} aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 border-t border-surface-200 bg-white ${
          menuOpen ? 'max-h-[32rem]' : 'max-h-0 border-t-0'
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
            <input
              type="text"
              placeholder="Search venues, areas..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>
          <Link href="/venues" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
            Venues
          </Link>
          <button onClick={handleHowItWorks} className="text-sm font-medium text-surface-800 py-1.5 text-left">
            How It Works
          </button>
          <Link href="/list-venue" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
            List Your Venue
          </Link>
          <Link href="/bookings" onClick={closeMenu} className="text-sm font-medium text-surface-800 py-1.5">
            My Bookings
          </Link>
          <Link href="/login" onClick={closeMenu}>
            <Button variant="primary" className="w-full">
              Login / Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
