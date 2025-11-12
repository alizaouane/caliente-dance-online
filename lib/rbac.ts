import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin, hasActiveSubscription } from './auth'
import { createServerClient } from './supabase/server'

export async function requireAuth() {
  try {
    // Use getCurrentUser() which handles all validation without mutating cookies
    const user = await getCurrentUser()
    
    if (!user) {
      console.warn('No valid user found - redirecting to signin')
      redirect('/signin')
    }
    
    // Verify user profile exists (catches deleted users)
    const supabase = createServerClient()
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (profileError && profileError.code === 'PGRST116') {
      console.warn('User profile not found - user was deleted')
      // Return null to trigger redirect (don't mutate cookies in server component)
      redirect('/signin')
    }
    
    return user
  } catch (error) {
    console.error('Error in requireAuth:', error)
    redirect('/signin')
  }
}

export async function requireAdmin() {
  try {
    const user = await requireAuth()
    const admin = await isAdmin(user.id)
    if (!admin) {
      redirect('/')
    }
    return user
  } catch (error) {
    console.error('Error in requireAdmin:', error)
    redirect('/')
  }
}

export async function requireSubscription() {
  try {
    const user = await requireAuth()
    const hasSub = await hasActiveSubscription(user.id)
    if (!hasSub) {
      redirect('/pricing')
    }
    return user
  } catch (error) {
    console.error('Error in requireSubscription:', error)
    redirect('/pricing')
  }
}

