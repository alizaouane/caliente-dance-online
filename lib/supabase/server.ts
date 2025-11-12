import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { SessionUser } from '@/types/auth'

/**
 * Creates a Supabase client for Server Components.
 * Uses cookies() from next/headers to access auth session.
 * 
 * This should only be used in Server Components or Server Actions.
 */
export const createServerClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

/**
 * Requires an authenticated user in server components/handlers.
 * Throws an error that should be caught and redirected.
 * 
 * @returns {Promise<{ supabase: ReturnType<typeof createServerClient>, user: SessionUser }>}
 * @throws {Error} If user is not authenticated
 */
export async function requireUser(): Promise<{
  supabase: ReturnType<typeof createServerClient>
  user: SessionUser
}> {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('UNAUTHENTICATED')
  }

  // Fetch profile to get role and other user data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url, email')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Profile missing - user may have been deleted or not yet created
    throw new Error('PROFILE_NOT_FOUND')
  }

  return {
    supabase,
    user: {
      id: user.id,
      email: profile.email || user.email || '',
      role: profile.role as 'admin' | 'member',
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    },
  }
}

/**
 * Requires an admin user. Redirects if not admin.
 * 
 * @returns {Promise<{ supabase: ReturnType<typeof createServerClient>, user: SessionUser }>}
 */
export async function requireAdmin(): Promise<{
  supabase: ReturnType<typeof createServerClient>
  user: SessionUser
}> {
  const { supabase, user } = await requireUser()

  if (user.role !== 'admin') {
    redirect('/')
  }

  return { supabase, user }
}

/**
 * Service role client for admin operations.
 * 
 * ⚠️ WARNING: This uses the service role key which bypasses RLS.
 * Only use in API routes with proper authorization checks.
 * Never import this in client components.
 * 
 * Features:
 * - autoRefreshToken: false (no token refresh needed)
 * - persistSession: false (no session storage)
 */
export const createServiceClient = (): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
