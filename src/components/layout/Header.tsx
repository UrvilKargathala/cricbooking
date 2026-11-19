'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight, ArrowRight, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function getInitials(name?: string) {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U'
}

export function Header() {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setIsVisible(true)
  }, [pathname])

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

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen])

  return (
    <header
      className={`sticky top-4 sm:top-5 z-50 w-full px-3 sm:px-6 mb-3 sm:mb-4 transition-all duration-300 ease-in-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-none'
          : 'translate-y-[-150%] opacity-0 pointer-events-none'
      }`}
    >
      <div className={`max-w-[1240px] mx-auto ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className="backdrop-blur-xl bg-[#05130E]/90 border border-[#C7FF00]/25 hover:border-[#C7FF00]/40 rounded-full pl-3.5 sm:pl-5 pr-2 py-1.5 sm:py-2 flex items-center justify-between shadow-[0_12px_36px_rgba(0,0,0,0.45),0_0_24px_rgba(199,255,0,0.1)] transition-all">
          {/* Logo & City */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="relative size-8 sm:size-9 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <Image
                  src="/figma/logo-icon.svg"
                  alt="CricBooking"
                  width={34}
                  height={34}
                  className="size-8 sm:size-[34px] block drop-shadow-[0_0_8px_rgba(199,255,0,0.35)]"
                  priority
                />
              </div>
              <div className="flex items-baseline tracking-tight font-['Geist'] whitespace-nowrap">
                <span className="text-[20px] sm:text-[22px] font-semibold text-white">
                  Cric
                </span>
                <span className="text-[20px] sm:text-[22px] font-semibold text-[#C7FF00] drop-shadow-[0_0_12px_rgba(199,255,0,0.3)]">
                  Booking
                </span>
                <span className="text-xs text-[#C7FF00]/80 align-super ml-0.5 font-medium">®</span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 bg-[#C7FF00]/10 border border-[#C7FF00]/25 hover:border-[#C7FF00]/45 px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-default">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C7FF00] opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-[#C7FF00] shadow-[0_0_6px_#C7FF00]"></span>
              </span>
              <span className="text-[12px] sm:text-[13px] text-[#C7FF00] font-medium tracking-wide">
                Surat
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/venues"
              className={`px-3.5 py-1.5 rounded-full text-[14px] sm:text-[15px] font-medium transition-all ${
                pathname === '/venues'
                  ? 'bg-[#C7FF00]/15 text-[#C7FF00] border border-[#C7FF00]/30 shadow-[0_0_12px_rgba(199,255,0,0.15)]'
                  : 'text-white/80 hover:text-[#C7FF00] hover:bg-white/5'
              }`}
            >
              Venues
            </Link>

            <Link
              href="/#live-scores"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[14px] sm:text-[15px] font-medium transition-all ${
                pathname === '/#live-scores'
                  ? 'bg-[#C7FF00]/15 text-[#C7FF00] border border-[#C7FF00]/30 shadow-[0_0_12px_rgba(199,255,0,0.15)]'
                  : 'text-white/80 hover:text-[#C7FF00] hover:bg-white/5'
              }`}
            >
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3b30] opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]"></span>
              </span>
              <span>Live</span>
            </Link>

            <Link
              href="/how-it-works"
              className={`px-3.5 py-1.5 rounded-full text-[14px] sm:text-[15px] font-medium transition-all ${
                pathname === '/how-it-works'
                  ? 'bg-[#C7FF00]/15 text-[#C7FF00] border border-[#C7FF00]/30 shadow-[0_0_12px_rgba(199,255,0,0.15)]'
                  : 'text-white/80 hover:text-[#C7FF00] hover:bg-white/5'
              }`}
            >
              How it works
            </Link>

            <Link
              href="/list-venue"
              className={`px-3.5 py-1.5 rounded-full text-[14px] sm:text-[15px] font-medium transition-all ${
                pathname === '/list-venue'
                  ? 'bg-[#C7FF00]/15 text-[#C7FF00] border border-[#C7FF00]/30 shadow-[0_0_12px_rgba(199,255,0,0.15)]'
                  : 'text-white/80 hover:text-[#C7FF00] hover:bg-white/5'
              }`}
            >
              For owners
            </Link>

            <Link
              href="/blog"
              className={`px-3.5 py-1.5 rounded-full text-[14px] sm:text-[15px] font-medium transition-all ${
                pathname.startsWith('/blog')
                  ? 'bg-[#C7FF00]/15 text-[#C7FF00] border border-[#C7FF00]/30 shadow-[0_0_12px_rgba(199,255,0,0.15)]'
                  : 'text-white/80 hover:text-[#C7FF00] hover:bg-white/5'
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* User & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                href="/bookings"
                className="bg-white/10 hover:bg-white/15 border border-[#C7FF00]/25 transition-all flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full text-[14px] text-white"
              >
                <span className="size-7 rounded-full bg-[#C7FF00] text-[#05130E] font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(199,255,0,0.4)]">
                  {getInitials(user.email || 'User')}
                </span>
                <span className="hidden sm:inline font-medium text-white/90">My bookings</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-3 py-1.5 text-[14px] sm:text-[15px] font-medium text-white/80 hover:text-[#C7FF00] transition-colors"
              >
                Log in
              </Link>
            )}

            <Link
              href="/venues"
              className="group bg-[#C7FF00] hover:bg-[#d4ff1a] text-[#05130E] hover:shadow-[0_0_20px_rgba(199,255,0,0.45)] transition-all duration-200 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-semibold whitespace-nowrap flex items-center gap-1.5 active:scale-95 shadow-[0_2px_12px_rgba(199,255,0,0.25)]"
            >
              <span>Book a turf</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-[#C7FF00] transition-colors"
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
          <div className="lg:hidden mt-2.5 max-w-[1240px] mx-auto pointer-events-auto relative z-50">
            <div className="backdrop-blur-2xl bg-[#05130E]/95 border border-[#C7FF00]/25 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(199,255,0,0.12)] flex flex-col gap-2">
              <div className="flex items-center justify-between pb-3 mb-1 border-b border-white/10 px-2">
                <div className="flex items-center gap-1.5 bg-[#C7FF00]/10 border border-[#C7FF00]/25 px-2.5 py-1 rounded-full">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C7FF00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-[#C7FF00]"></span>
                  </span>
                  <span className="text-[12px] text-[#C7FF00] font-medium">Surat, Gujarat</span>
                </div>
                <span className="text-xs text-white/60">Live booking open</span>
              </div>

              <Link
                href="/venues"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#C7FF00] hover:bg-white/10 transition-colors"
              >
                <span>Find Venues</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/#live-scores"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#C7FF00] hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3b30] opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]"></span>
                  </span>
                  <span>Live Matches</span>
                </div>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#C7FF00] hover:bg-white/10 transition-colors"
              >
                <span>How it works</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/list-venue"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#C7FF00] hover:bg-white/10 transition-colors"
              >
                <span>List your venue (Owner)</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/blog"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#C7FF00] hover:bg-white/10 transition-colors"
              >
                <span>Blog</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:text-[#C7FF00] hover:bg-white/10 transition-colors"
              >
                <span>Contact</span>
                <ChevronRight className="size-4 text-white/40" />
              </Link>

              <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2.5">
                {user ? (
                  <Link
                    href="/bookings"
                    className="px-4 py-3 rounded-2xl bg-white/10 text-white font-medium text-center hover:bg-white/15 transition-colors"
                  >
                    My Bookings
                  </Link>
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
                  className="px-4 py-3.5 rounded-2xl bg-[#C7FF00] hover:bg-[#d4ff1a] text-[#05130E] font-semibold text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(199,255,0,0.35)] transition-all"
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
