import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Check if Supabase env vars are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res })
    const { data: { session } } = await supabase.auth.getSession()
    const { pathname } = request.nextUrl

    // Admin routes - require authentication and admin role
    if (pathname.startsWith('/admin')) {
      if (!session) {
        return NextResponse.redirect(new URL('/signin', request.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Member routes - require authentication
    if (pathname.startsWith('/videos') || pathname.startsWith('/search')) {
      if (!session) {
        return NextResponse.redirect(new URL('/signin', request.url))
      }
    }

    // Auth routes - redirect to home if already logged in
    if ((pathname.startsWith('/signin') || pathname.startsWith('/signup')) && session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return res
  } catch (error) {
    // On error, continue with the request
    return res
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/videos/:path*',
    '/search/:path*',
    '/signin/:path*',
    '/signup/:path*',
  ],
}

