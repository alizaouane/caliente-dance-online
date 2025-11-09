'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    try {
      const supabase = createClient()
      
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        setUser(user)
        
        // Check if user is admin
        if (user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()
            
            if (profileError) {
              console.error('Error fetching profile:', profileError)
              setIsAdmin(false)
            } else {
              const adminStatus = profile?.role === 'admin'
              setIsAdmin(adminStatus)
              console.log('User role:', profile?.role, 'Is admin:', adminStatus)
            }
          } catch (err) {
            console.error('Error checking admin status:', err)
            setIsAdmin(false)
          }
        }
      }).catch((error) => {
        console.error('Error getting user:', error)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null)
        
        // Check if user is admin
        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single()
            
            if (profileError) {
              console.error('Error fetching profile on auth change:', profileError)
              setIsAdmin(false)
            } else {
              const adminStatus = profile?.role === 'admin'
              setIsAdmin(adminStatus)
              console.log('Auth change - User role:', profile?.role, 'Is admin:', adminStatus)
            }
          } catch (err) {
            console.error('Error checking admin status on auth change:', err)
            setIsAdmin(false)
          }
        } else {
          setIsAdmin(false)
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
                <Link href="/admin" className="text-sm font-medium hover:text-primary text-primary">
                  Admin
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

