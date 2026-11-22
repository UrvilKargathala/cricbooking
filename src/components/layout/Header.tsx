'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight, ArrowRight, ChevronDown, LogOut, CalendarDays, Heart, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function getInitials(name?: string) {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U'
}

export function Header() {
  const { user, signOut } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const isOwner = Boolean(user && (user.role === 'owner' || user.role === 'admin'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setAccountOpen(false)
    setIsVisible(true)
  }, [pathname])

  useEffect(() => {
    if (!accountOpen) return
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [accountOpen])

  // Mobile drawer body scroll locking
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setAtTop(currentScrollY < 20)

      // If mobile drawer is open, keep navbar visible
      if (mobileMenuOpen) {
        setIsVisible(true)
        return
      }

      // Return to top of page (< 20px) -> always visible
      if (currentScrollY < 20) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling down past threshold -> hide
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> slide back into view
        setIsVisible(true)
      }

      lastScrollY = currentScrollY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[transform,opacity,background-color] duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        pathname === '/' && atTop && !mobileMenuOpen ? 'bg-transparent' : 'bg-[#020B12]/85 backdrop-blur-xl'
      }`}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="h-[68px] sm:h-[76px] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          {/* Logo & City */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 lg:flex-1 lg:basis-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="relative size-8 sm:size-9 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <Image
                  src="/figma/logo-icon.svg"
                  alt="CricBooking"
                  width={34}
                  height={34}
                  className="size-8 sm:size-[34px] block"
                  priority
                />
              </div>
              <div className="flex items-baseline tracking-tight font-['Geist'] whitespace-nowrap">
                <span className="text-[18px] min-[400px]:text-[20px] sm:text-[22px] font-semibold text-white">
                  Cric
                </span>
                <span className="text-[18px] min-[400px]:text-[20px] sm:text-[22px] font-semibold text-[#FBBF24]">
                  Booking
                </span>
                <span className="text-xs text-[#FBBF24]/80 align-super ml-0.5 font-medium">®</span>
              </div>
            </Link>

          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex shrink-0 items-center justify-center gap-1 xl:gap-2">
            <Link
              href="/venues"
              className={`whitespace-nowrap px-3 lg:px-2.5 xl:px-3.5 py-2 text-[15px] xl:text-[16px] font-normal transition-colors ${
                pathname === '/venues'
                  ? 'text-[#FBBF24]'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              Venues
            </Link>

            <Link
              href="/how-it-works"
              className={`whitespace-nowrap px-3 lg:px-2.5 xl:px-3.5 py-2 text-[15px] xl:text-[16px] font-normal transition-colors ${
                pathname === '/how-it-works'
                  ? 'text-[#FBBF24]'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              How it works
            </Link>

            <Link
              href="/list-venue"
              className={`whitespace-nowrap px-3 lg:px-2.5 xl:px-3.5 py-2 text-[15px] xl:text-[16px] font-normal transition-colors ${
                pathname === '/list-venue'
                  ? 'text-[#FBBF24]'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              For owners
            </Link>

            <Link
              href="/blog"
              className={`whitespace-nowrap px-3 lg:px-2.5 xl:px-3.5 py-2 text-[15px] xl:text-[16px] font-normal transition-colors ${
                pathname.startsWith('/blog')
                  ? 'text-[#FBBF24]'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* User & CTA */}
          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3 lg:flex-1 lg:basis-0">
            {user ? (
              <div ref={accountRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label="Account menu"
                  className="flex shrink-0 items-center gap-1.5 rounded-full p-1 pr-2 text-[14px] text-white hover:bg-white/10 transition-colors"
                >
                  <span className="size-7 rounded-full bg-[#F59E0B] text-[#05130E] font-bold text-xs flex items-center justify-center">
                    {getInitials(user.full_name || user.email || 'User')}
                  </span>
                  <ChevronDown className={`size-4 text-white/70 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountOpen && (
                  <div role="menu" className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-[#020B12] p-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                      <p className="text-[14px] font-medium truncate">{user.full_name || 'Your account'}</p>
                      <p className="text-[12px] text-white/60 truncate">{user.email}</p>
                    </div>
                    {[
                      { href: '/bookings', label: 'My bookings', icon: CalendarDays },
                      { href: '/wishlist', label: 'Wishlist', icon: Heart },
                      { href: '/profile', label: 'Profile', icon: User },
                      ...(isOwner ? [{ href: '/dashboard', label: 'Owner dashboard', icon: LayoutDashboard }] : []),
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] text-white/85 hover:bg-white/10 hover:text-white"
                      >
                        <item.icon className="size-4 text-[#FBBF24]" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => signOut('/')}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-t border-white/10 px-3 py-2.5 text-[14px] text-white/85 hover:bg-white/10 hover:text-white"
                    >
                      <LogOut className="size-4 text-white/60" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-3 py-1.5 text-[14px] sm:text-[15px] font-medium text-white/80 hover:text-[#FBBF24] transition-colors"
              >
                Log in
              </Link>
            )}

            <Link
              href="/venues"
              className="group shrink-0 bg-[#F59E0B] hover:bg-[#D97706] text-[#05130E] transition-all duration-200 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-semibold whitespace-nowrap flex items-center gap-1.5 active:scale-95"
            >
              <span>Book a turf</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden shrink-0 p-2 -mr-1 text-white/80 hover:text-[#FBBF24] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          {mounted &&
            createPortal(
              <div
                className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />,
              document.body
            )}
          <div className="lg:hidden max-w-[1440px] mx-auto px-4 sm:px-6 pb-4 pointer-events-auto relative z-50">
            <div className="bg-[#020B12] border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-2">
              <div className="flex items-center justify-between pb-3 mb-1 border-b border-white/10 px-2">
                <div className="flex items-center gap-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/25 px-2.5 py-1 rounded-full">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-[#F59E0B]"></span>
                  </span>
                  <span className="text-[12px] text-[#FBBF24] font-medium">Surat, Gujarat</span>
                </div>
                <span className="text-xs text-white/60">Instant booking</span>
              </div>

              <Link
                href="/venues"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#FBBF24] hover:bg-white/10 transition-colors"
              >
                <span>Find Venues</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#FBBF24] hover:bg-white/10 transition-colors"
              >
                <span>How it works</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/list-venue"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#FBBF24] hover:bg-white/10 transition-colors"
              >
                <span>List your venue (Owner)</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/blog"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#FBBF24] hover:bg-white/10 transition-colors"
              >
                <span>Blog</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#FBBF24] hover:bg-white/10 transition-colors"
              >
                <span>Contact</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>

              <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2.5">
                {user && (user.role === 'owner' || user.role === 'admin') && (
                  <Link
                    href="/dashboard"
                    className="px-4 py-3 rounded-2xl bg-white/10 text-white font-medium text-center hover:bg-white/15 transition-colors"
                  >
                    Owner dashboard
                  </Link>
                )}
                {user ? (
                  <>
                    <Link
                      href="/bookings"
                      className="px-4 py-3 rounded-2xl bg-white/10 text-white font-medium text-center hover:bg-white/15 transition-colors"
                    >
                      My Bookings
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut('/')}
                      className="px-4 py-3 rounded-2xl border border-white/15 text-white/85 font-medium text-center hover:bg-white/10 transition-colors"
                    >
                      Log out{user.email ? ` (${user.email})` : ''}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-3 rounded-2xl bg-white/10 text-white font-medium text-center hover:bg-white/15 transition-colors"
                  >
                    Log In
                  </Link>
                )}

                <Link
                  href="/venues"
                  className="px-4 py-3.5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-[#05130E] font-semibold text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
                >
                  <span>Book a turf</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
