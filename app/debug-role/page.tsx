'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DebugRolePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setProfile(profileData)
        }
      }
      setLoading(false)
    }
    checkRole()
  }, [])

  if (loading) {
    return (
      <div className="container py-12">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to check your role.</p>
            <Link href="/signin">
              <Button className="mt-4">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>Role Debug Information</CardTitle>
          <CardDescription>Check your current user role and admin status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">User ID:</p>
            <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email:</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Current Role:</p>
            <p className={`text-sm font-bold ${isAdmin ? 'text-green-600' : 'text-orange-600'}`}>
              {profile?.role || 'Not set (defaults to member)'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Is Admin:</p>
            <p className={`text-sm font-bold ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
              {isAdmin ? 'YES ✓' : 'NO ✗'}
            </p>
          </div>
          
          {!isAdmin && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm font-medium text-orange-900 mb-2">To become an admin:</p>
              <ol className="text-sm text-orange-800 list-decimal list-inside space-y-1">
                <li>Go to Supabase Dashboard → Table Editor → profiles</li>
                <li>Find your user (ID: {user.id})</li>
                <li>Change the role field from &apos;member&apos; to &apos;admin&apos;</li>
                <li>Save and refresh this page</li>
              </ol>
            </div>
          )}

          {isAdmin && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-medium text-green-900 mb-2">You are an admin! ✓</p>
              <Link href="/admin">
                <Button className="mt-2">Go to Admin Dashboard</Button>
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

