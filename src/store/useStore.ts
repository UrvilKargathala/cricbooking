import { create } from 'zustand'
import type { Profile } from '@/types'

interface AppStore {
  user: Profile | null
  setUser: (user: Profile | null) => void
  selectedArea: string | null
  setSelectedArea: (slug: string | null) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  selectedArea: null,
  setSelectedArea: (slug) => set({ selectedArea: slug }),
  selectedDate: new Date().toISOString().slice(0, 10),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))
