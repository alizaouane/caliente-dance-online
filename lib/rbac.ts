import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin, hasActiveSubscription } from './auth'

export async function requireAuth() {
  try {
    const user = await getCurrentUser()
    if (!user) {
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

