import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'

export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: 'cricbooking-auth' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

/**
 * Signed-in user for an API route. Accepts either the website's auth cookie
 * or an `Authorization: Bearer <access token>` header (used by the mobile app).
 */
export async function getAuthedUser() {
  const auth = headers().get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined
  const { data: { user } } = await createServerSupabaseClient().auth.getUser(token)
  return user
}
