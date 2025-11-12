import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/server'

/**
 * Protected layout for admin routes.
 * Requires authentication AND admin role - redirects if not authorized.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
    return <>{children}</>
  } catch (error: any) {
    if (error.message === 'UNAUTHENTICATED' || error.message === 'PROFILE_NOT_FOUND') {
      redirect('/signin')
    }
    // Not admin - redirect to home
    redirect('/')
  }
}

