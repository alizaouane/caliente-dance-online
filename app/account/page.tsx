import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AccountPage() {
  try {
    const { user, supabase } = await requireUser()

    // Fetch subscription status if needed
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
                  <p className="font-medium">{user.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription?.status === 'active' || subscription?.status === 'trialing' ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="default" className="mt-1">
                        {subscription.status}
                      </Badge>
                    </div>
                    {subscription.current_period_end && (
                      <div>
                        <p className="text-sm text-muted-foreground">Next Billing Date</p>
                        <p className="font-medium">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <Button asChild>
                      <Link href="/api/stripe/portal">Manage Billing</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-4">
                      You don&apos;t have an active subscription. Subscribe to access all videos.
                    </p>
                    <Button asChild>
                      <Link href="/pricing">View Pricing</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {user.role === 'admin' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Admin</CardTitle>
                <CardDescription>Access the admin dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin">Go to Admin Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  } catch (error: any) {
    if (error.message === 'UNAUTHENTICATED' || error.message === 'PROFILE_NOT_FOUND') {
      redirect('/signin')
    }
    throw error
  }
}
