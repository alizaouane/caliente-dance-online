import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { VideoForm } from '@/components/VideoForm'

export default async function EditVideoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data: video } = await supabase
    .from('videos')
    .select(`
      *,
      video_styles(styles(id)),
      video_levels(levels(id))
    `)
    .eq('id', params.id)
    .single()

  if (!video) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Video</h1>
      <VideoForm video={video} />
    </div>
  )
}

