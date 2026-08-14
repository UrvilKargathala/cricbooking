'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (submittingRef.current) return
    if (!authLoading && user) {
      if (user.role === 'admin') router.push('/admin')
      else if (user.role === 'owner') router.push('/dashboard')
      else router.push('/')
    }
  }, [user, authLoading, router])

  const handleSubmit = async () => {
    submittingRef.current = true
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      submittingRef.current = false
      setError('Invalid credentials.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      setError('Access denied. Admin privileges required.')
      await supabase.auth.signOut()
      submittingRef.current = false
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  if (!submittingRef.current && (authLoading || user)) return null

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-xl border border-surface-200 p-8">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-bold text-xl text-surface-900 mt-4">Admin Access</h1>
          <p className="text-sm text-surface-800/60 mt-1">CricBooking Platform Admin</p>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-800 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="admin@cricbooking.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-lg text-sm placeholder:text-surface-800/40 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 bg-surface-100 border border-surface-200 rounded-lg text-sm placeholder:text-surface-800/40 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-800/40 hover:text-surface-800"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!email || !password || loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full font-medium text-sm px-5 py-2.5 mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
