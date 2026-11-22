import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

const OWNER_ROLES = ['owner', 'admin']

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  const isDashboardHost = hostname.startsWith('dashboard.')

  // On dashboard.<domain>, show the dashboard pages at the root. API routes are shared and never rewritten.
  let effectivePath = pathname
  if (isDashboardHost && !pathname.startsWith('/dashboard') && !pathname.startsWith('/api')) {
    effectivePath = pathname === '/login' ? '/dashboard/login' : pathname === '/' ? '/dashboard' : `/dashboard${pathname}`
  }

  const { user, supabaseResponse, supabase } = await updateSession(request)

  const urlOnThisHost = (path: string) => {
    const url = new URL(path, `${request.nextUrl.protocol}//${hostname || request.nextUrl.host}`)
    if (isDashboardHost && url.pathname.startsWith('/dashboard')) {
      url.pathname = url.pathname === '/dashboard/login' ? '/login' : url.pathname.replace(/^\/dashboard/, '') || '/'
    }
    return url
  }

  if (!isDashboardHost && (pathname === '/wishlist' || pathname === '/profile' || pathname.startsWith('/bookings'))) {
    if (!user) {
      const loginUrl = urlOnThisHost('/login')
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  if (effectivePath.startsWith('/dashboard') && !effectivePath.startsWith('/dashboard/login')) {
    if (!user) {
      const loginUrl = urlOnThisHost('/dashboard/login')
      loginUrl.searchParams.set('redirect', effectivePath)
      loginUrl.searchParams.set('reason', 'signed-out')
      return NextResponse.redirect(loginUrl)
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (!profile || !OWNER_ROLES.includes(profile.role)) {
      return NextResponse.redirect(urlOnThisHost('/dashboard/login'))
    }
  }

  if (effectivePath !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = effectivePath
    const rewrite = NextResponse.rewrite(url, { request: { headers: request.headers } })
    supabaseResponse.cookies.getAll().forEach((cookie) => rewrite.cookies.set(cookie))
    return rewrite
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
