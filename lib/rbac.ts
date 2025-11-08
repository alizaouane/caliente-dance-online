import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin, hasActiveSubscription } from './auth'

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/signin')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const admin = await isAdmin(user.id)
  if (!admin) {
    redirect('/')
  }
  return user
}

export async function requireSubscription() {
  const user = await requireAuth()
  const hasSub = await hasActiveSubscription(user.id)
  if (!hasSub) {
    redirect('/pricing')
  }
  return user
}

