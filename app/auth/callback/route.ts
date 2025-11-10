import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle errors (e.g., expired token)
  if (error) {
    const errorMessage = errorDescription || error
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/signin', requestUrl.origin))
  }

  try {
    const supabase = createServerClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      )
    }

    if (data?.session) {
      // Successfully authenticated, redirect to videos
      return NextResponse.redirect(new URL('/videos', requestUrl.origin))
    }

    // No session after exchange, redirect to signin
    return NextResponse.redirect(new URL('/signin', requestUrl.origin))
  } catch (err: any) {
    console.error('Auth callback error:', err)
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(err.message || 'Authentication failed')}`, requestUrl.origin)
    )
  }
}

