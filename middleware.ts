import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    
    // Check if Supabase env vars are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return res
    }

    const supabase = createMiddlewareClient({ req: request, res })

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // If there's an error getting session, continue without auth checks
    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return res
    }

    const { pathname } = request.nextUrl

    // Admin routes - require authentication and admin role
    if (pathname.startsWith('/admin')) {
      if (!session) {
        return NextResponse.redirect(new URL('/signin', request.url))
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profileError || profile?.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url))
        }
      } catch (error) {
        console.error('Error checking admin role:', error)
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
    if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      if (session) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, just continue with the request
    return NextResponse.next()
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

