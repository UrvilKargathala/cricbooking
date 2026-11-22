'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    let cancelled = false

    const loadProfile = async (userId: string) => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (!cancelled) {
        setUser(profile)
        setLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (session?.user) {
        const userId = session.user.id
        setTimeout(() => loadProfile(userId), 0)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (cancelled) return
      if (authUser) {
        loadProfile(authUser.id)
      } else {
        setLoading(false)
      }
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  const signOut = async (redirectTo = '/login') => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = redirectTo
  }

  return { user, loading, signOut }
}
