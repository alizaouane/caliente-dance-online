'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useToast } from '@/components/ui/use-toast'

export function NavBar() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  
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

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (signingOut) return // Prevent double clicks
    
    setSigningOut(true)
    
    try {
      const supabase = createClient()
      
      // Clear local state first
      setUser(null)
      setIsAdmin(false)
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to signin page (not home, to avoid any loops)
      window.location.replace('/signin')
    } catch (error: any) {
      console.error('Error signing out:', error)
      // Force redirect to signin on error
      window.location.replace('/signin')
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
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
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

