import { requireAdmin } from '@/lib/rbac'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createServerClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="font-semibold">
              Admin Dashboard
            </Link>
            <nav className="flex space-x-4">
              <Link href="/admin" className="text-sm font-medium hover:text-primary">
                Overview
              </Link>
              <Link href="/admin/videos" className="text-sm font-medium hover:text-primary">
                Videos
              </Link>
              <Link href="/admin/styles" className="text-sm font-medium hover:text-primary">
                Styles
              </Link>
              <Link href="/admin/levels" className="text-sm font-medium hover:text-primary">
                Levels
              </Link>
              <Link href="/admin/subscribers" className="text-sm font-medium hover:text-primary">
                Subscribers
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Link href="/">
              <Button variant="outline" size="sm">Back to Site</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="container py-8">
        {children}
      </div>
    </div>
  )
}

