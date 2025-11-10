'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function NavBar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  
  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    
    // Set a timeout to ensure loading always resolves
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth check timeout - setting loading to false')
        setLoading(false)
      }
    }, 3000) // 3 second timeout
    
    // Get initial user
    supabase.auth.getUser()
      .then(async ({ data: { user }, error }) => {
        if (!mounted) return
        
        if (error) {
          console.error('Error getting user:', error)
          // Clear session if invalid
          await supabase.auth.signOut()
          setUser(null)
          setLoading(false)
          clearTimeout(timeoutId)
          return
        }
        
        // Verify user profile exists (catches deleted users)
        if (user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()
          
          if (profileError && profileError.code === 'PGRST116') {
            console.warn('User profile not found - user was deleted, clearing session')
            await supabase.auth.signOut()
            setUser(null)
            setLoading(false)
            clearTimeout(timeoutId)
            return
          }
          
          setUser(user)
          checkAdminStatus(user.id, supabase).finally(() => {
            if (mounted) {
              clearTimeout(timeoutId)
            }
          })
        } else {
          setUser(null)
          setLoading(false)
          clearTimeout(timeoutId)
        }
      })
      .catch((error) => {
        console.error('Error in getUser:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
          clearTimeout(timeoutId)
        }
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await checkAdminStatus(currentUser.id, supabase)
      } else {
        setIsAdmin(false)
        setLoading(false)
      }
      clearTimeout(timeoutId)
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const checkAdminStatus = async (userId: string, supabase: ReturnType<typeof createClient>) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching profile:', error)
        setIsAdmin(false)
      } else {
        setIsAdmin(profile?.role === 'admin')
      }
    } catch (err) {
      console.error('Error checking admin status:', err)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (signingOut) return
    
    setSigningOut(true)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }
      
      // Clear local state
      setUser(null)
      setIsAdmin(false)
      
      // Force hard navigation to clear all state
      window.location.href = '/signin'
    } catch (error: any) {
      console.error('Error signing out:', error)
      window.location.href = '/signin'
    }
  }

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Caliente Dance</span>
          </Link>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </nav>
    )
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
              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </>
          ) : (
            <>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary">
                Pricing
              </Link>
              <Link 
                href="/signin"
                className="text-sm font-medium hover:text-primary"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 h-10"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
