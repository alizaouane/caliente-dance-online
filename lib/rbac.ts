import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin, hasActiveSubscription } from './auth'
import { createServerClient } from './supabase/server'

export async function requireAuth() {
  try {
    const supabase = createServerClient()
    
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.warn('No valid session found')
      redirect('/signin')
    }
    
    // Verify the user actually exists
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.warn('User not found or session invalid, clearing session')
      await supabase.auth.signOut()
      redirect('/signin')
    }
    
    // Double-check: verify user profile exists (catches deleted users)
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (profileError && profileError.code === 'PGRST116') {
      console.warn('User profile not found - user was deleted, clearing session')
      await supabase.auth.signOut()
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

