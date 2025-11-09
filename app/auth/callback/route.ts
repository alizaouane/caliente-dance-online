import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

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

  if (code) {
    try {
      const supabase = createServerClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        return NextResponse.redirect(
          new URL(`/signin?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }
    } catch (err: any) {
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent(err.message || 'Authentication failed')}`, requestUrl.origin)
      )
    }
  }

  return NextResponse.redirect(new URL('/videos', requestUrl.origin))
}

