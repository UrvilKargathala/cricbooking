import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  withArrow?: boolean
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-[#c9f13e] text-black hover:bg-[#b8e12d] font-medium shadow-sm transition-all duration-200 active:scale-[0.98]',
  dark:
    'bg-black text-white hover:bg-neutral-800 font-medium shadow-sm transition-all duration-200 active:scale-[0.98]',
  secondary:
    'bg-[#f4f6f8] text-black hover:bg-[#eef1f4] font-medium transition-all duration-200 active:scale-[0.98]',
  outline:
    'border border-[#e3e5e8] bg-transparent text-black hover:bg-[#f4f6f8] font-medium transition-all duration-200 active:scale-[0.98]',
  ghost:
    'text-black hover:bg-[#f4f6f8] font-medium transition-all duration-200',
}

const sizeClasses: Record<string, string> = {
  sm: 'text-[13px] px-3.5 py-1.5 min-h-[36px]',
  md: 'text-[15px] px-5 py-2.5 min-h-[46px]',
  lg: 'text-[15px] pl-[22px] pr-2 min-h-[50px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', withArrow = false, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#c9f13e] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variantClasses[variant],
          sizeClasses[size],
          withArrow && variant === 'primary' && 'pr-2',
          withArrow && variant === 'dark' && 'pr-2',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {withArrow && (
          <span
            className={cn(
              'inline-flex items-center justify-center size-[34px] rounded-full shrink-0 transition-transform duration-200 group-hover:translate-x-0.5',
              variant === 'primary' ? 'bg-black text-[#c9f13e]' : 'bg-[#c9f13e] text-black'
            )}
          >
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          </span>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
