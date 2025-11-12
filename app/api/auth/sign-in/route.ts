import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const magicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.literal('magic_link'),
})

const oauthSchema = z.object({
  provider: z.enum(['google']),
})

/**
 * POST /api/auth/sign-in
 * 
 * Supports three sign-in methods:
 * 1. Email/password: { email, password }
 * 2. Magic link: { email, type: 'magic_link' }
 * 3. OAuth: { provider: 'google' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const nextUrl = request.nextUrl.searchParams.get('next') || '/videos'

    // Handle OAuth
    if (body.provider) {
      const { provider } = oauthSchema.parse(body)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({ url: data.url })
    }

    // Handle magic link
    if (body.type === 'magic_link') {
      const { email } = magicLinkSchema.parse(body)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: 'Check your email for the magic link',
      })
    }

    // Handle email/password
    const { email, password } = signInSchema.parse(body)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Sign in failed' },
        { status: 400 }
      )
    }

    // Ensure profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      // Create profile if missing
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email || email,
        })
    }

    // Log auth event (using service client to bypass RLS)
    try {
      const serviceClient = createServiceClient()
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await serviceClient.rpc('log_auth_event', {
        p_user_id: data.user.id,
        p_event: 'sign_in',
        p_ip: clientIp,
        p_user_agent: userAgent,
      } as any)
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error('Failed to log auth event:', logError)
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      redirectTo: nextUrl,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Sign-in error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    )
  }
}

