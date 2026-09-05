import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request)
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  const isDashboard = hostname.startsWith('dashboard.')

  if (isDashboard && !pathname.startsWith('/dashboard') && pathname !== '/login') {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? '/dashboard' : `/dashboard${pathname}`
    return NextResponse.rewrite(url, { request: { headers: request.headers } })
  }

  const publicRoutes = ['/', '/login', '/venues', '/list-venue']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/venues/')
  )

  if (isPublicRoute) {
    return supabaseResponse
  }

  if (pathname === '/wishlist' || pathname === '/profile' || pathname.startsWith('/bookings')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      if (isDashboard) loginUrl.searchParams.set('redirect', '/dashboard')
      return NextResponse.redirect(loginUrl)
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
