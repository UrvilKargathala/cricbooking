import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  | 'pending' | 'approved' | 'rejected' | 'suspended'
  | 'online' | 'walkin' | 'phone'
  | 'paid' | 'refunded'
  | 'live' | 'featured' | 'rating' | 'chip' | 'selected'

const variantClasses: Record<string, { bg: string; dot?: string }> = {
  confirmed: { bg: 'bg-[#FEF3C7] text-[#92400E]', dot: 'bg-[#92400E]' },
  cancelled: { bg: 'bg-red-50 text-red-800', dot: 'bg-red-500' },
  completed: { bg: 'bg-[#f4f6f8] text-[#50555c]', dot: 'bg-gray-400' },
  no_show: { bg: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  pending: { bg: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  approved: { bg: 'bg-[#FEF3C7] text-[#92400E]', dot: 'bg-[#92400E]' },
  rejected: { bg: 'bg-red-50 text-red-800', dot: 'bg-red-500' },
  suspended: { bg: 'bg-[#f4f6f8] text-[#50555c]', dot: 'bg-gray-400' },
  online: { bg: 'bg-[#e3ebfa] text-[#1849c9]', dot: 'bg-[#1849c9]' },
  walkin: { bg: 'bg-[#f4f6f8] text-black', dot: 'bg-neutral-600' },
  phone: { bg: 'bg-purple-50 text-purple-800', dot: 'bg-purple-500' },
  paid: { bg: 'bg-[#FEF3C7] text-[#92400E]', dot: 'bg-[#92400E]' },
  refunded: { bg: 'bg-red-50 text-red-800', dot: 'bg-red-500' },
  live: { bg: 'bg-[#e5484d] text-white', dot: 'bg-white' },
  featured: { bg: 'bg-[#F59E0B] text-black' },
  rating: { bg: 'bg-[#F59E0B] text-black' },
  selected: { bg: 'bg-black text-white' },
  chip: { bg: 'bg-white text-black border border-[#e3e5e8]' },
}

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}

export function Badge({ variant = 'chip', className, children }: BadgeProps) {
  const config = variantClasses[variant] || { bg: 'bg-[#f4f6f8] text-black' }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1 rounded-full whitespace-nowrap',
        config.bg,
        className
      )}
    >
      {config.dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />}
      {children}
    </span>
  )
}
