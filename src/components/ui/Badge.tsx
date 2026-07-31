import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  | 'pending' | 'approved' | 'rejected' | 'suspended'
  | 'online' | 'walkin' | 'phone'

const variantClasses: Record<BadgeVariant, { bg: string; dot: string }> = {
  confirmed: { bg: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-50 text-red-800', dot: 'bg-red-500' },
  completed: { bg: 'bg-surface-100 text-surface-800', dot: 'bg-gray-400' },
  no_show: { bg: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  pending: { bg: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  approved: { bg: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50 text-red-800', dot: 'bg-red-500' },
  suspended: { bg: 'bg-surface-100 text-surface-800', dot: 'bg-gray-400' },
  online: { bg: 'bg-blue-50 text-blue-800', dot: 'bg-blue-500' },
  walkin: { bg: 'bg-brand-50 text-brand-800', dot: 'bg-brand-400' },
  phone: { bg: 'bg-purple-50 text-purple-800', dot: 'bg-purple-500' },
}

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  const classes = variantClasses[variant]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full', classes.bg)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', classes.dot)} />
      {children}
    </span>
  )
}
