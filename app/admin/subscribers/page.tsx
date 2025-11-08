import { createServiceClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminSubscribersPage() {
  const supabase = createServiceClient()

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  // Get user emails using service role
  const userIds = subscriptions?.map((s: any) => s.user_id) || []
  const { data: users } = await supabase.auth.admin.listUsers()

  const subscriptionsWithEmails = subscriptions?.map((sub: any) => {
    const user = users?.users.find((u: any) => u.id === sub.user_id)
    return {
      ...sub,
      user_email: user?.email || 'Unknown',
    }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Subscribers</h1>

      <div className="space-y-4">
        {subscriptionsWithEmails?.map((subscription: any) => (
          <Card key={subscription.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{subscription.user_email || 'Unknown'}</h3>
                  <p className="text-sm text-muted-foreground">
                    Customer ID: {subscription.stripe_customer_id || 'N/A'}
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-sm text-muted-foreground">
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      subscription.status === 'active' || subscription.status === 'trialing'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {subscription.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Since {new Date(subscription.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!subscriptionsWithEmails || subscriptionsWithEmails.length === 0) && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No subscribers yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

