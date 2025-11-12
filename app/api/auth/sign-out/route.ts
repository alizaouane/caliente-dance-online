import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/sign-out
 * 
 * Signs out the current user and clears the session.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get user before signing out (for logging)
    const { data: { user } } = await supabase.auth.getUser()

    // Sign out
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Log auth event (using service client to bypass RLS)
    if (user) {
      try {
        const serviceClient = createServiceClient()
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'
        
        await serviceClient.rpc('log_auth_event', {
          p_user_id: user.id,
          p_event: 'sign_out',
          p_ip: clientIp,
          p_user_agent: userAgent,
        } as any)
      } catch (logError) {
        // Don't fail the request if logging fails
        console.error('Failed to log auth event:', logError)
      }
    }

    return NextResponse.json({ message: 'Signed out successfully' })
  } catch (error: any) {
    console.error('Sign-out error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sign out' },
      { status: 500 }
    )
  }
}

