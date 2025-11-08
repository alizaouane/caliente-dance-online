import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration } from '@/lib/utils'
import { getPublicUrl } from '@/lib/storage'
import Image from 'next/image'

export default async function AdminVideosPage() {
  const supabase = createServerClient()

  const { data: videos } = await supabase
    .from('videos')
    .select(`
      *,
      video_styles(styles(id, name, slug)),
      video_levels(levels(id, name))
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Videos</h1>
        <Link href="/admin/videos/new">
          <Button>+ Add New Video</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {videos?.map((video: any) => {
          const thumbnailUrl = video.thumbnail_path
            ? getPublicUrl('thumbnails', video.thumbnail_path)
            : null
          const styles = video.video_styles?.map((vs: any) => vs.styles) || []
          const levels = video.video_levels?.map((vl: any) => vl.levels) || []

          return (
            <Card key={video.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="relative w-48 h-32 bg-muted rounded overflow-hidden flex-shrink-0">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {styles.map((style: any) => (
                            <Badge key={style.id} variant="secondary" className="text-xs">
                              {style.name}
                            </Badge>
                          ))}
                          {levels.map((level: any) => (
                            <Badge key={level.id} variant="outline" className="text-xs">
                              {level.name}
                            </Badge>
                          ))}
                          {video.published ? (
                            <Badge variant="default" className="text-xs">Published</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Draft</Badge>
                          )}
                        </div>
                        {video.duration_seconds && (
                          <p className="text-sm text-muted-foreground">
                            Duration: {formatDuration(video.duration_seconds)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/admin/videos/edit/${video.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Link href={`/videos/${video.slug}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {(!videos || videos.length === 0) && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No videos yet.</p>
              <Link href="/admin/videos/new">
                <Button>Create Your First Video</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

