'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    
    // Check for error in URL params (from email confirmation)
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error) {
      toast({
        title: 'Authentication Error',
        description: decodeURIComponent(error),
        variant: 'destructive',
      })
      // Clean up URL
      window.history.replaceState({}, '', '/signin')
    }

    // Check if already logged in (but don't block if check fails)
    supabase.auth.getUser()
      .then(async ({ data: { user }, error: userError }) => {
        if (userError) {
          console.error('Error checking user:', userError)
          return
        }
        if (user) {
          try {
            // Verify profile exists before redirecting
            const { error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single()
            
            if (!profileError) {
              router.push('/videos')
            }
          } catch (error) {
            // If profile check fails, allow signin
            console.error('Profile check error:', error)
          }
        }
      })
      .catch((error) => {
        console.error('Error in getUser check:', error)
        // Allow signin to proceed even if check fails
      })
  }, [router, toast, supabase])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading || !mounted) return
    
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        throw error
      }

      if (data?.user && data?.session) {
        toast({
          title: 'Success',
          description: 'Signed in successfully!',
        })
        
        // Wait a moment for session to be set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Force a hard navigation to ensure session is loaded
        window.location.href = '/videos'
      } else {
        throw new Error('No user or session returned')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in. Please check your credentials.',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (loading || !mounted) return
    
    setLoading(true)
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !mounted}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || !mounted}
          >
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
