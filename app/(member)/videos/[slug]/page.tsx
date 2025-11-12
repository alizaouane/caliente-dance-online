import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { VideoPlayer } from '@/components/VideoPlayer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils'
import { getPublicUrl, getSignedUrl } from '@/lib/storage'
import { VideoCard } from '@/components/VideoCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function VideoPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createServerClient()

  // Fetch video with relations
  const { data: video } = await supabase
    .from('videos')
    .select(`
      *,
      video_styles(styles(id, name, slug)),
      video_levels(levels(id, name))
    `)
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!video) {
    notFound()
  }

  // Record view (without user_id since auth is removed)
  await supabase
    .from('video_views')
    .insert({
      video_id: video.id,
    })

  // Get related videos (same style or level)
  const styleIds = video.video_styles?.map((vs: any) => vs.styles.id) || []
  const { data: relatedVideos } = await supabase
    .from('videos')
    .select(`
      id,
      slug,
      title,
      thumbnail_path,
      duration_seconds,
      video_styles(styles(id, name, slug)),
      video_levels(levels(id, name))
    `)
    .eq('published', true)
    .neq('id', video.id)
    .in('video_styles.style_id', styleIds)
    .limit(6)

  const transformedRelated = relatedVideos?.map((v: any) => ({
    id: v.id,
    slug: v.slug,
    title: v.title,
    thumbnailPath: v.thumbnail_path,
    durationSeconds: v.duration_seconds,
    styles: v.video_styles?.map((vs: any) => vs.styles) || [],
    levels: v.video_levels?.map((vl: any) => vl.levels) || [],
  })) || []

  // Get video URL (show preview for all users since auth is removed)
  let videoUrl: string | null = null
  let previewUrl: string | null = null

  try {
    if (video.preview_path) {
      previewUrl = await getSignedUrl('previews', video.preview_path, 3600)
    } else if (video.video_path) {
      videoUrl = await getSignedUrl('videos', video.video_path, 3600)
    }
  } catch (error) {
    console.error('Error getting video URLs:', error)
  }

  const thumbnailUrl = video.thumbnail_path
    ? getPublicUrl('thumbnails', video.thumbnail_path)
    : null

  const styles = video.video_styles?.map((vs: any) => vs.styles) || []
  const levels = video.video_levels?.map((vl: any) => vl.levels) || []

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VideoPlayer
              videoUrl={videoUrl}
              previewUrl={previewUrl}
              hasSubscription={true}
              thumbnailUrl={thumbnailUrl}
            />

            <div className="mt-6">
              <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {styles.map((style: any) => (
                  <Badge key={style.id} variant="secondary">
                    {style.name}
                  </Badge>
                ))}
                {levels.map((level: any) => (
                  <Badge key={level.id} variant="outline">
                    {level.name}
                  </Badge>
                ))}
                {video.duration_seconds && (
                  <Badge variant="outline">
                    {formatDuration(video.duration_seconds)}
                  </Badge>
                )}
              </div>
              {video.teacher && (
                <p className="text-muted-foreground mb-4">
                  Instructor: <span className="font-medium">{video.teacher}</span>
                </p>
              )}
              {video.description && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="whitespace-pre-line">{video.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
            {transformedRelated.length > 0 ? (
              <div className="space-y-4">
                {transformedRelated.map((related) => (
                  <VideoCard key={related.id} {...related} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No related videos found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

