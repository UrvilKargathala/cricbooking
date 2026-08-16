import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Car, Droplet, Bath, Armchair, Lightbulb, Shirt, Cross, Coffee, Dumbbell, Wifi } from 'lucide-react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatTime(time: string) {
  const [hourStr, minuteStr] = time.split(':')
  const hour = parseInt(hourStr, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minuteStr} ${period}`
}

export function generateBookingCode() {
  const date = new Date()
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `CB-${yy}${mm}${dd}-${random}`
}

export const AMENITY_LABELS: Record<string, string> = {
  parking: 'Parking',
  drinking_water: 'Drinking Water',
  restrooms: 'Restrooms',
  seating: 'Seating',
  lighting: 'Floodlights',
  changing_room: 'Changing Room',
  first_aid: 'First Aid',
  cafe: 'Cafeteria',
  equipment: 'Equipment Rental',
  wifi: 'WiFi',
}

export const AMENITY_ICONS: Record<string, typeof Car> = {
  parking: Car,
  drinking_water: Droplet,
  restrooms: Bath,
  seating: Armchair,
  lighting: Lightbulb,
  changing_room: Shirt,
  first_aid: Cross,
  cafe: Coffee,
  equipment: Dumbbell,
  wifi: Wifi,
}

export const SPORT_LABELS: Record<string, string> = {
  box_cricket: 'Box Cricket',
  cricket: 'Cricket',
  football: 'Football',
  badminton: 'Badminton',
  tennis: 'Tennis',
  multi_sport: 'Multi Sport',
}

export const SURFACE_LABELS: Record<string, string> = {
  turf: 'Artificial Turf',
  mat: 'Mat',
  cement: 'Cement',
  natural_grass: 'Natural Grass',
  synthetic: 'Synthetic',
}
