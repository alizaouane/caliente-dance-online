import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KPI } from '@/components/KPI'

export default async function AdminDashboard() {
  const supabase = createServerClient()

  // Get total subscribers
  const { count: subscriberCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .in('status', ['active', 'trialing'])

  // Get total videos
  const { count: videoCount } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })

  // Get published videos
  const { count: publishedCount } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  // Get total views (approximate)
  const { count: viewCount } = await supabase
    .from('video_views')
    .select('*', { count: 'exact', head: true })

  // Calculate MRR (simplified - assumes $19.99/month for all)
  // TODO: Calculate actual MRR from subscription data
  const mrr = (subscriberCount || 0) * 19.99

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPI
          title="Active Subscribers"
          value={subscriberCount?.toString() || '0'}
          description="Currently active"
        />
        <KPI
          title="Monthly Revenue"
          value={`$${mrr.toFixed(2)}`}
          description="Estimated MRR"
        />
        <KPI
          title="Total Videos"
          value={videoCount?.toString() || '0'}
          description={`${publishedCount || 0} published`}
        />
        <KPI
          title="Total Views"
          value={viewCount?.toString() || '0'}
          description="All time"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/videos/new" className="block text-sm text-primary hover:underline">
              + Add New Video
            </a>
            <a href="/admin/styles" className="block text-sm text-primary hover:underline">
              Manage Dance Styles
            </a>
            <a href="/admin/levels" className="block text-sm text-primary hover:underline">
              Manage Levels
            </a>
            <a href="/admin/subscribers" className="block text-sm text-primary hover:underline">
              View Subscribers
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

