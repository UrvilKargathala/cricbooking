'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useFavorites() {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set())
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('favorites')
      .select('venue_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setFavoriteIds(new Set((data ?? []).map((row) => row.venue_id)))
        setLoading(false)
      })
  }, [user])

  const isFavorite = (venueId: string) => favoriteIds.has(venueId)

  const toggleFavorite = async (venueId: string) => {
    if (!user) return 'signed_out' as const

    const supabase = createClient()
    const wasFavorite = favoriteIds.has(venueId)

    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (wasFavorite) next.delete(venueId)
      else next.add(venueId)
      return next
    })

    if (wasFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('venue_id', venueId)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, venue_id: venueId })
    }
    return wasFavorite ? ('removed' as const) : ('added' as const)
  }

  return { favoriteIds, isFavorite, toggleFavorite, loading }
}
