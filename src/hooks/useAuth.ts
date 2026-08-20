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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (!cancelled) setUser(profile)
      } else {
        setUser(null)
      }
      if (!cancelled) setLoading(false)
    })

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (cancelled) return
      if (authUser) {
        supabase.from('profiles').select('*').eq('id', authUser.id).single()
          .then(({ data: profile }) => { if (!cancelled) { setUser(profile); setLoading(false) } })
      } else {
        setLoading(false)
      }
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return { user, loading, signOut }
}
