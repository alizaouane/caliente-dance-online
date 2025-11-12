import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BillingPortalButton } from '@/components/BillingPortalButton'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AccountPage() {
  // Authentication removed - page is now public

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Authentication has been removed. This page is no longer functional.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Authentication has been removed. This page is no longer functional.
              </p>
              <Button asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

