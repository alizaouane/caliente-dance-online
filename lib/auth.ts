import { createServerClient } from './supabase/server'
import { createClient } from './supabase/client'

export async function getCurrentUser() {
  try {
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      // Return null instead of trying to sign out (server components can't mutate cookies)
      return null
    }
    
    // Verify user still exists by checking if we can get their profile
    // This catches cases where user was deleted but session still exists
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      // If profile doesn't exist, user was likely deleted
      if (profileError && profileError.code === 'PGRST116') {
        console.warn('User profile not found - user may have been deleted')
        // Return null instead of trying to sign out (server components can't mutate cookies)
        return null
      }
    }
    
    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

export async function getCurrentProfile() {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error getting profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error in getCurrentProfile:', error)
    return null
  }
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const supabase = createServerClient()
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single()

    if (error || !subscription) return false

    // Check if subscription hasn't expired
    if (subscription.current_period_end) {
      const now = new Date()
      const periodEnd = new Date(subscription.current_period_end)
      return periodEnd > now
    }

    return subscription.status === 'active' || subscription.status === 'trialing'
  } catch (error) {
    console.error('Error in hasActiveSubscription:', error)
    return false
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createServerClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return profile?.role === 'admin'
  } catch (error) {
    console.error('Error in isAdmin:', error)
    return false
  }
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

