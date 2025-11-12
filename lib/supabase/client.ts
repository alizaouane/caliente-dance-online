'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

/**
 * Creates a Supabase client for browser-side usage.
 * Uses httpOnly cookies managed by @supabase/auth-helpers-nextjs.
 * 
 * This client should only be used in Client Components.
 * For Server Components, use createServerClient from lib/supabase/server.ts
 */
export const createClient = () => {
  // Validate environment variables in browser
  if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      throw new Error('Missing Supabase environment variables')
    }
  }

  // createClientComponentClient handles singleton internally and manages cookies
  return createClientComponentClient<Database>()
}
