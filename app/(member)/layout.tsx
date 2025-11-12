import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/supabase/server'

/**
 * Protected layout for member routes.
 * Requires authentication - redirects to sign-in if not authenticated.
 */
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireUser()
    return <>{children}</>
  } catch (error: any) {
    if (error.message === 'UNAUTHENTICATED' || error.message === 'PROFILE_NOT_FOUND') {
      redirect('/signin')
    }
    throw error
  }
}

