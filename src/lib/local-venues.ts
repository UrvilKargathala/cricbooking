import type { Venue } from '@/types'

const STORAGE_KEY = 'cricbooking_added_venues'

export function loadLocalVenues(): Venue[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalVenues(venues: Venue[]) {
  if (typeof window === 'undefined') return
  // Blob preview URLs (from URL.createObjectURL) don't survive a reload, so persist without images.
  const persistable = venues.map((v) => ({ ...v, images: [], cover_image: null }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
}
