import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/rbac'
import { getCurrentProfile, hasActiveSubscription } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BillingPortalButton } from '@/components/BillingPortalButton'
import { Badge } from '@/components/ui/badge'

export default async function AccountPage() {
  const user = await requireAuth()
  const profile = await getCurrentProfile()
  const hasSub = await hasActiveSubscription(user.id)
  const supabase = createServerClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', user.id)
    .single()

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
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Level</p>
                <p className="font-medium">{profile?.preferred_level || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasSub ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="default" className="mt-1">
                      {subscription?.status || 'Active'}
                    </Badge>
                  </div>
                  {subscription?.current_period_end && (
                    <div>
                      <p className="text-sm text-muted-foreground">Next Billing Date</p>
                      <p className="font-medium">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <BillingPortalButton />
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    You don't have an active subscription. Subscribe to access all videos.
                  </p>
                  <Button asChild>
                    <a href="/pricing">View Pricing</a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

