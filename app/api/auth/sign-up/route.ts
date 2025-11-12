import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().optional(),
})

/**
 * POST /api/auth/sign-up
 * 
 * Creates a new user account with email/password.
 * Profile is automatically created via database trigger.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name } = signUpSchema.parse(body)
    const supabase = createServerClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || null,
        },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Sign up failed' },
        { status: 400 }
      )
    }

    // Profile is created automatically via trigger, but ensure it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      // Create profile if trigger didn't fire
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email || email,
          full_name: full_name || null,
        })
    }

    return NextResponse.json({
      message: data.user.email_confirmed_at
        ? 'Account created successfully'
        : 'Please check your email to confirm your account',
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed: !!data.user.email_confirmed_at,
      },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Sign-up error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}

