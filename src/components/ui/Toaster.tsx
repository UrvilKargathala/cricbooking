'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore, type Toast } from '@/store/useToastStore'

const VARIANT_STYLES: Record<Toast['variant'], { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'bg-emerald-600 text-white' },
  error: { icon: XCircle, classes: 'bg-red-600 text-white' },
  info: { icon: Info, classes: 'bg-surface-900 text-white' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useToastStore((s) => s.dismissToast)
  const { icon: Icon, classes } = VARIANT_STYLES[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), 3500)
    return () => clearTimeout(timer)
  }, [toast.id, dismissToast])

  return (
    <div className={cn('flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-xl shadow-lg min-w-[260px] max-w-sm', classes)}>
      <Icon className="w-4.5 h-4.5 shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={() => dismissToast(toast.id)} aria-label="Dismiss" className="opacity-70 hover:opacity-100 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
