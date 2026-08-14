import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Public routes — no protection needed
  const publicRoutes = ['/', '/login', '/venues', '/list-venue', '/dashboard/login', '/admin/login']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/venues/')
  )

  if (isPublicRoute) {
    return supabaseResponse
  }

  // Protected: /bookings — requires any logged-in user
  if (pathname === '/bookings') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // Protected: /dashboard/* — requires role = 'owner'
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url))
    }
    // Check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/login', request.url))
    }
    return supabaseResponse
  }

  // Protected: /admin/* — requires role = 'admin'
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
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
