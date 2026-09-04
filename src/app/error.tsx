'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-display font-bold text-red-500">500</p>
        <h1 className="font-display font-semibold text-2xl text-surface-900 mt-4">Something went wrong</h1>
        <p className="text-sm text-surface-800/60 mt-2 leading-relaxed">
          An unexpected error occurred. Try refreshing the page.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
