'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight } from 'lucide-react'
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
      className={`sticky top-3 z-50 w-full px-3 sm:px-6 transition-all duration-300 ease-in-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-none'
          : 'translate-y-[-150%] opacity-0 pointer-events-none'
      }`}
    >
      <div className={`max-w-[1240px] mx-auto ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className="backdrop-blur-[18px] bg-[rgba(0,0,0,0.88)] border border-white/10 rounded-full pl-4 sm:pl-5 pr-2 py-2 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          {/* Logo & City */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/figma/logo-icon.svg"
                alt="CricBooking"
                width={32}
                height={32}
                className="size-8 block transition-transform group-hover:scale-105"
                priority
              />
              <span className="text-[20px] sm:text-[22px] font-medium tracking-tight text-white font-['Geist'] whitespace-nowrap">
                CricBooking<span className="text-xs align-super opacity-70">®</span>
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Image src="/figma/pin-icon.svg" alt="" width={12} height={12} className="size-3 block" />
              <span className="text-[13px] text-white/90 font-medium">Surat</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/venues"
              className={`px-3.5 py-2 rounded-full text-[15px] font-medium transition-colors ${
                pathname === '/venues'
                  ? 'bg-white/15 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Venues
            </Link>

            <Link
              href="/#live-scores"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[15px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="size-2 rounded-full bg-[#e5484d] animate-pulse" />
              <span>Live</span>
            </Link>

            <Link
              href="/how-it-works"
              className={`px-3.5 py-2 rounded-full text-[15px] font-medium transition-colors ${
                pathname === '/how-it-works'
                  ? 'bg-white/15 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              How it works
            </Link>

            <Link
              href="/list-venue"
              className={`px-3.5 py-2 rounded-full text-[15px] font-medium transition-colors ${
                pathname === '/list-venue'
                  ? 'bg-white/15 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              For owners
            </Link>

            <Link
              href="/blog"
              className={`px-3.5 py-2 rounded-full text-[15px] font-medium transition-colors ${
                pathname.startsWith('/blog')
                  ? 'bg-white/15 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* User & CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {user ? (
              <Link
                href="/bookings"
                className="bg-white/10 hover:bg-white/15 transition-colors flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full text-[14px] text-white"
              >
                <span className="size-7 rounded-full bg-white text-black font-semibold text-xs flex items-center justify-center">
                  {getInitials(user.email || 'User')}
                </span>
                <span className="hidden sm:inline font-medium">My bookings</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-[15px] font-medium text-white/90 hover:text-white transition-colors"
              >
                Log in
              </Link>
            )}

            <Link
              href="/venues"
              className="bg-white text-black hover:bg-neutral-200 transition-colors px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[14px] sm:text-[15px] font-medium whitespace-nowrap shadow-sm active:scale-95"
            >
              Book a turf
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white"
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />,
              document.body
            )}
          <div className="lg:hidden mt-2 max-w-[1240px] mx-auto pointer-events-auto relative z-50">
            <div className="backdrop-blur-xl bg-black/95 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-2">
            <Link
              href="/venues"
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:bg-white/10"
            >
              <span>Find Venues</span>
              <ChevronRight className="size-4 text-white/40" />
            </Link>
            <Link
              href="/#live-scores"
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#e5484d] animate-pulse" />
                <span>Live Matches</span>
              </div>
              <ChevronRight className="size-4 text-white/40" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:bg-white/10"
            >
              <span>How it works</span>
              <ChevronRight className="size-4 text-white/40" />
            </Link>
            <Link
              href="/list-venue"
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:bg-white/10"
            >
              <span>List your venue (Owner)</span>
              <ChevronRight className="size-4 text-white/40" />
            </Link>
            <Link
              href="/blog"
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:bg-white/10"
            >
              <span>Blog</span>
              <ChevronRight className="size-4 text-white/40" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-[16px] font-medium text-white hover:bg-white/10"
            >
              <span>Contact</span>
              <ChevronRight className="size-4 text-white/40" />
            </Link>

            <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/bookings"
                  className="px-4 py-3 rounded-2xl bg-white/10 text-white font-medium text-center"
                >
                  My Bookings
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-3 rounded-2xl bg-white/10 text-white font-medium text-center"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      </>
    )}
  </header>
  )
}
