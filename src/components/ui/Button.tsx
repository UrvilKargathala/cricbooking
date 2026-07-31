import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

// Liquid-glass pill styling, adapted from Figma (CENTR-8 OS, node 131:11622).
const variantClasses: Record<string, string> = {
  primary:
    'bg-brand-600 text-white shadow-[0_1px_8px_0_rgba(0,0,0,0.15),inset_2px_2px_0.5px_-2px_rgba(255,255,255,0.6),inset_-2px_-2px_0.5px_-2px_rgba(255,255,255,0.25),inset_0_0_1px_1px_rgba(255,255,255,0.15),inset_0_0_10px_0_rgba(255,255,255,0.2)] hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'bg-surface-800/10 backdrop-blur-md text-surface-900 shadow-[0_1px_8px_0_rgba(0,0,0,0.1),inset_2px_2px_0.5px_-2px_rgba(255,255,255,0.9),inset_-2px_-2px_0.5px_-2px_rgba(0,0,0,0.06),inset_0_0_1px_1px_rgba(166,166,166,0.4),inset_0_0_8px_0_rgba(242,242,242,0.6)] hover:bg-surface-800/15',
  outline:
    'border border-brand-600 text-brand-600 bg-white/40 backdrop-blur-md hover:bg-brand-50/70',
  ghost: 'text-surface-800 hover:bg-surface-100/70 backdrop-blur-sm',
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm px-4 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
