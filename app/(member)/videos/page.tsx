import { createServerClient } from '@/lib/supabase/server'
import { VideoCard } from '@/components/VideoCard'
import { FiltersBar } from '@/components/FiltersBar'
import { EmptyState } from '@/components/EmptyState'

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { q?: string; style?: string; level?: string; sort?: string }
}) {
  const supabase = createServerClient()

  // Fetch styles and levels for filters
  const { data: styles } = await supabase
    .from('styles')
    .select('id, name, slug')
    .order('position')

  const { data: levels } = await supabase
    .from('levels')
    .select('id, name')
    .order('position')

  // Build query with filters
  let query = supabase
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

  if (searchParams.style) {
    // Filter by style using a subquery
    const { data: styleVideos } = await supabase
      .from('video_styles')
      .select('video_id')
      .eq('style_id', searchParams.style)
    
    const videoIds = styleVideos?.map(vs => vs.video_id) || []
    if (videoIds.length > 0) {
      query = query.in('id', videoIds)
    } else {
      // No videos with this style, return empty
      query = query.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  if (searchParams.level) {
    // Filter by level using a subquery
    const { data: levelVideos } = await supabase
      .from('video_levels')
      .select('video_id')
      .eq('level_id', searchParams.level)
    
    const videoIds = levelVideos?.map(vl => vl.video_id) || []
    if (videoIds.length > 0) {
      query = query.in('id', videoIds)
    } else {
      // No videos with this level, return empty
      query = query.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }

  // Sorting
  switch (searchParams.sort) {
    case 'popular':
      // TODO: Add view count sorting when analytics are implemented
      query = query.order('created_at', { ascending: false })
      break
    case 'duration':
      query = query.order('duration_seconds', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: videos } = await query.limit(50)

  // Transform data for VideoCard
  const transformedVideos = videos?.map((video: any) => ({
    id: video.id,
    slug: video.slug,
    title: video.title,
    thumbnailPath: video.thumbnail_path,
    durationSeconds: video.duration_seconds,
    styles: video.video_styles?.map((vs: any) => vs.styles) || [],
    levels: video.video_levels?.map((vl: any) => vl.levels) || [],
  })) || []

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Video Library</h1>

      <FiltersBar
        styles={styles || []}
        levels={levels || []}
      />

      {transformedVideos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {transformedVideos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No videos found"
          description="Try adjusting your filters or check back later for new content."
        />
      )}
    </div>
  )
}

