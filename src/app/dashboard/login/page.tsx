'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function OwnerLoginPage() {
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
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'owner' && profile?.role !== 'admin') {
      setError('This account does not have owner access. Please contact support.')
      await supabase.auth.signOut()
      submittingRef.current = false
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (!submittingRef.current && (authLoading || user)) return null

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto py-16 px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-surface-200 p-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="font-display font-bold text-xl text-surface-900 mt-4">Owner Dashboard</h1>
            <p className="text-sm text-surface-800/60 mt-1">Sign in to manage your venue</p>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-800 rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="owner@email.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 bg-surface-100 border border-surface-200 rounded-lg text-sm placeholder:text-surface-800/40 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
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
              onClick={() => alert('Password reset coming in next phase.')}
              className="text-sm text-brand-600 hover:underline text-right"
            >
              Forgot password?
            </button>

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!email || !password || loading}
              className="mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>

          <div className="flex flex-col gap-2 mt-6 text-sm text-center text-surface-800/60">
            <p>
              Are you a player?{' '}
              <a href="/login" className="text-brand-600 font-medium hover:underline">
                Login with phone
              </a>
            </p>
            <p>
              Want to list your venue?{' '}
              <a href="/list-venue" className="text-brand-600 font-medium hover:underline">
                Register here
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
