import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  const publicRoutes = ['/', '/login', '/venues', '/list-venue']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/venues/')
  )

  if (isPublicRoute) {
    return supabaseResponse
  }

  if (pathname === '/bookings' || pathname === '/wishlist') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
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
