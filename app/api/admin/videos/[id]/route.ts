import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    // Update video
    const { error: videoError } = await supabase
      .from('videos')
      .update({
        title: body.title,
        slug: body.slug,
        description: body.description,
        duration_seconds: body.duration_seconds,
        teacher: body.teacher,
        published: body.published,
        video_path: body.video_path || null,
        preview_path: body.preview_path || null,
        thumbnail_path: body.thumbnail_path || null,
      })
      .eq('id', params.id)

    if (videoError) throw videoError

    // Update styles
    await supabase
      .from('video_styles')
      .delete()
      .eq('video_id', params.id)

    if (body.selectedStyles?.length > 0) {
      await supabase
        .from('video_styles')
        .insert(
          body.selectedStyles.map((styleId: string) => ({
            video_id: params.id,
            style_id: styleId,
          }))
        )
    }

    // Update levels
    await supabase
      .from('video_levels')
      .delete()
      .eq('video_id', params.id)

    if (body.selectedLevels?.length > 0) {
      await supabase
        .from('video_levels')
        .insert(
          body.selectedLevels.map((levelId: string) => ({
            video_id: params.id,
            level_id: levelId,
          }))
        )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update video' },
      { status: 500 }
    )
  }
}

