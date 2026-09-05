import { createBrowserClient } from '@supabase/ssr'

const isProduction = typeof window !== 'undefined' && window.location.hostname.endsWith('cricbooking.in')

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'cricbooking-auth',
        ...(isProduction ? { domain: '.cricbooking.in' } : {}),
      },
    }
  )
}
