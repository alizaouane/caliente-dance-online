import { createServerClient } from './supabase/server'
import { createClient } from './supabase/client'

export async function getCurrentUser() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = createServerClient()
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .single()

  if (!subscription) return false

  // Check if subscription hasn't expired
  if (subscription.current_period_end) {
    const now = new Date()
    const periodEnd = new Date(subscription.current_period_end)
    return periodEnd > now
  }

  return subscription.status === 'active' || subscription.status === 'trialing'
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createServerClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'admin'
}

// Client-side helpers
export function useAuth() {
  const supabase = createClient()
  
  return {
    signOut: async () => {
      await supabase.auth.signOut()
      window.location.href = '/signin'
    },
    getUser: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  }
}

