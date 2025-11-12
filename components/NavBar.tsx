'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { AuthGate } from './AuthGate'

export function NavBar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    // Get initial user
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (!mounted) return

      if (error || !user) {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setUser(user)

      // Check admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        setIsAdmin(true)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single()

        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
      })

      if (response.ok) {
        setUser(null)
        setIsAdmin(false)
        router.push('/signin')
        router.refresh()
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">Caliente Dance</span>
        </Link>

        <div className="flex items-center space-x-6">
          {!loading && user ? (
            <>
              <Link href="/videos" className="text-sm font-medium hover:text-primary">
                Videos
              </Link>
              <Link href="/account" className="text-sm font-medium hover:text-primary">
                Account
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-medium hover:text-primary text-primary font-semibold">
                  Admin
                </Link>
              )}
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary">
                Pricing
              </Link>
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
