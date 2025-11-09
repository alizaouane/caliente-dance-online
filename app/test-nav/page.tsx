'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TestNavPage() {
  const router = useRouter()

  return (
    <div className="container py-12 space-y-8">
      <h1 className="text-3xl font-bold">Navigation Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Link Components:</h2>
        <div className="flex gap-4">
          <Link href="/signin" className="text-primary hover:underline">
            Sign In (Link)
          </Link>
          <Link href="/signup" className="text-primary hover:underline">
            Sign Up (Link)
          </Link>
          <Link href="/" className="text-primary hover:underline">
            Home (Link)
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Router.push():</h2>
        <div className="flex gap-4">
          <Button onClick={() => {
            console.log('Router.push to /signin')
            router.push('/signin')
          }}>
            Sign In (Router)
          </Button>
          <Button onClick={() => {
            console.log('Router.push to /signup')
            router.push('/signup')
          }}>
            Sign Up (Router)
          </Button>
          <Button onClick={() => {
            console.log('Router.push to /')
            router.push('/')
          }}>
            Home (Router)
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">window.location.href:</h2>
        <div className="flex gap-4">
          <Button onClick={() => {
            console.log('window.location.href to /signin')
            window.location.href = '/signin'
          }}>
            Sign In (window.location)
          </Button>
          <Button onClick={() => {
            console.log('window.location.href to /signup')
            window.location.href = '/signup'
          }}>
            Sign Up (window.location)
          </Button>
          <Button onClick={() => {
            console.log('window.location.href to /')
            window.location.href = '/'
          }}>
            Home (window.location)
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current URL:</h2>
        <p className="text-muted-foreground">
          {typeof window !== 'undefined' ? window.location.href : 'Server-side'}
        </p>
      </div>
    </div>
  )
}

