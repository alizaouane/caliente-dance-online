import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for route protection and authentication checks.
 * 
 * Protected routes:
 * - /videos, /account, /search: Require authentication (member or admin)
 * - /admin/** : Require authentication AND admin role
 * 
 * Public routes:
 * - /, /pricing, /signin, /signup, /reset-password, /auth/callback
 */
export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = request.nextUrl

  // Check if Supabase env vars are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // If env vars are missing, allow request through (will fail at component level)
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res })
    const { data: { session } } = await supabase.auth.getSession()

    // Public routes - no auth required
    const publicRoutes = ['/', '/pricing', '/signin', '/signup', '/reset-password']
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth/callback')

    if (isPublicRoute) {
      return res
    }

    // Admin routes - require authentication AND admin role
    if (pathname.startsWith('/admin')) {
      if (!session) {
        const signInUrl = new URL('/signin', request.url)
        signInUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(signInUrl)
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        // Not an admin - redirect to home
        return NextResponse.redirect(new URL('/', request.url))
      }

      return res
    }

    // Member routes - require authentication
    const memberRoutes = ['/videos', '/account', '/search']
    const isMemberRoute = memberRoutes.some(route => pathname.startsWith(route))

    if (isMemberRoute) {
      if (!session) {
        const signInUrl = new URL('/signin', request.url)
        signInUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(signInUrl)
      }

      return res
    }

    // All other routes - allow through
    return res
  } catch (error) {
    // On error, continue with the request (will be handled at component level)
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
