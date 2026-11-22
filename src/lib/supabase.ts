import { createBrowserClient } from '@supabase/ssr'
import { cookieDomainFor } from '@/lib/authCookies'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'cricbooking-auth',
        ...cookieDomainFor(typeof window !== 'undefined' ? window.location.hostname : null),
      },
    }
  )
}
