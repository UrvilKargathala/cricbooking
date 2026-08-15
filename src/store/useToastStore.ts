import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}

interface ToastStore {
  toasts: Toast[]
  showToast: (message: string, variant?: Toast['variant']) => void
  dismissToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (message, variant = 'success') =>
    set((state) => ({ toasts: [...state.toasts, { id: crypto.randomUUID(), message, variant }] })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
