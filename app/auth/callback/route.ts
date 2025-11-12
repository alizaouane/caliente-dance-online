import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /auth/callback
 * 
 * Handles OAuth callbacks and email confirmation links.
 * Exchanges the code for a session and redirects to the intended destination.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/videos'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    const signInUrl = new URL('/signin', requestUrl.origin)
    signInUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(signInUrl)
  }

  // Exchange code for session
  if (code) {
    const supabase = createServerClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      const signInUrl = new URL('/signin', requestUrl.origin)
      signInUrl.searchParams.set('error', 'Failed to authenticate. Please try again.')
      return NextResponse.redirect(signInUrl)
    }

    // Ensure profile exists
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Create profile if missing
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          })
      }
    }

    // Redirect to intended destination
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // No code provided - redirect to sign in
  return NextResponse.redirect(new URL('/signin', requestUrl.origin))
}

