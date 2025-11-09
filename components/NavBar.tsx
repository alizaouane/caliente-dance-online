'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  
  const checkAdminStatus = async (userId: string, supabase: ReturnType<typeof createClient>) => {
    try {
      setCheckingAdmin(true)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (profileError) {
        console.error('Error fetching profile:', profileError)
        console.error('Profile error details:', JSON.stringify(profileError, null, 2))
        setIsAdmin(false)
      } else {
        const adminStatus = profile?.role === 'admin'
        setIsAdmin(adminStatus)
        console.log('✅ User role:', profile?.role, 'Is admin:', adminStatus, 'User ID:', userId)
      }
    } catch (err) {
      console.error('Error checking admin status:', err)
      setIsAdmin(false)
    } finally {
      setCheckingAdmin(false)
    }
  }
  
  useEffect(() => {
    try {
      const supabase = createClient()
      
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        setUser(user)
        
        // Check if user is admin
        if (user) {
          await checkAdminStatus(user.id, supabase)
        } else {
          setCheckingAdmin(false)
        }
      }).catch((error) => {
        console.error('Error getting user:', error)
        setCheckingAdmin(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null)
        
        // Check if user is admin
        if (session?.user) {
          await checkAdminStatus(session.user.id, supabase)
        } else {
          setIsAdmin(false)
          setCheckingAdmin(false)
        }
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error initializing NavBar:', error)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">Caliente Dance</span>
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
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
              {/* Temporary: Always show admin link for debugging - will be hidden if not admin by middleware */}
              {!isAdmin && !checkingAdmin && (
                <Link 
                  href="/admin" 
                  className="text-sm font-medium hover:text-primary text-orange-600"
                  title="Click to test admin access (will redirect if not admin)"
                >
                  Admin (Test)
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={handleSignOut}
              >
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

