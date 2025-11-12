import { createServerClient } from '@/lib/supabase/server'
import { VideoCard } from '@/components/VideoCard'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchForm } from '@/components/SearchForm'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createServerClient()

  let videos: any[] = []

  if (searchParams.q) {
    const { data } = await supabase
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
      .or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    videos = data || []
  }

  const transformedVideos = videos.map((video: any) => ({
    id: video.id,
    slug: video.slug,
    title: video.title,
    thumbnailPath: video.thumbnail_path,
    durationSeconds: video.duration_seconds,
    styles: video.video_styles?.map((vs: any) => vs.styles) || [],
    levels: video.video_levels?.map((vl: any) => vl.levels) || [],
  }))

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Search</h1>

      <SearchForm initialQuery={searchParams.q} />

      {searchParams.q ? (
        <>
          <p className="text-muted-foreground mb-6">
            {transformedVideos.length} result{transformedVideos.length !== 1 ? 's' : ''} for &quot;{searchParams.q}&quot;
          </p>
          {transformedVideos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {transformedVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No results found"
              description="Try a different search term or browse our video library."
              action={{ label: 'Browse Videos', href: '/videos' }}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="Start searching"
          description="Enter a search term to find videos in our library."
        />
      )}
    </div>
  )
}

