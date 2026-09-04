'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-7xl font-display font-bold text-brand-600">404</p>
          <h1 className="font-display font-semibold text-2xl text-surface-900 mt-4">Page not found</h1>
          <p className="text-sm text-surface-800/60 mt-2 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-700 transition-colors"
            >
              Go home
            </Link>
            <Link
              href="/venues"
              className="inline-flex items-center gap-1.5 border border-surface-200 text-surface-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-surface-100 transition-colors"
            >
              Browse venues
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
