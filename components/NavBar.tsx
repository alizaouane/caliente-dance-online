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
    
    // Set a shorter timeout to ensure loading always resolves
    const timeoutId = setTimeout(() => {
      if (mounted) {
        // Silently set loading to false without warning
        setLoading(false)
      }
    }, 2000) // 2 second timeout
    
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
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single()
            
            if (profileError && profileError.code === 'PGRST116') {
              // User profile not found - user was deleted, clear session silently
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
          } catch (err) {
            // If profile check fails, just set user and continue
            setUser(user)
            setIsAdmin(false)
            setLoading(false)
            clearTimeout(timeoutId)
          }
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
      
      // Verify user profile exists (catches deleted users)
      if (currentUser) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', currentUser.id)
            .single()
          
          if (profileError && profileError.code === 'PGRST116') {
            // User profile not found - user was deleted, clear session silently
            await supabase.auth.signOut()
            setUser(null)
            setIsAdmin(false)
            setLoading(false)
            clearTimeout(timeoutId)
            return
          }
          
          setUser(currentUser)
          await checkAdminStatus(currentUser.id, supabase)
        } catch (err) {
          // If profile check fails, just set user and continue
          setUser(currentUser)
          setIsAdmin(false)
          setLoading(false)
        }
      } else {
        setUser(null)
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

  // Don't block rendering - show buttons immediately
  // if (loading) {
  //   return (
  //     <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  //       <div className="container flex h-16 items-center justify-between">
  //         <Link href="/" className="flex items-center space-x-2">
  //           <span className="text-2xl font-bold text-primary">Caliente Dance</span>
  //         </Link>
  //         <div className="flex items-center space-x-6">
  //           <span className="text-sm text-muted-foreground">Loading...</span>
  //         </div>
  //       </div>
  //     </nav>
  //   )
  // }

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
              <Link href="/signin" className="text-sm font-medium hover:text-primary">
                <Button variant="ghost" className="h-auto p-0">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="h-10">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
