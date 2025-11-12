import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        title: body.title,
        slug: body.slug,
        description: body.description,
        duration_seconds: body.duration_seconds,
        teacher: body.teacher,
        published: body.published,
        video_path: body.video_path || null,
        preview_path: body.preview_path || null,
        thumbnail_path: body.thumbnail_path || null,
      } as any)
      .select()
      .single()

    if (error) throw error

    // Update styles
    if (body.selectedStyles?.length > 0 && video) {
      await supabase
        .from('video_styles')
        .insert(
          body.selectedStyles.map((styleId: string) => ({
            video_id: (video as any).id,
            style_id: styleId,
          })) as any
        )
    }

    // Update levels
    if (body.selectedLevels?.length > 0 && video) {
      await supabase
        .from('video_levels')
        .insert(
          body.selectedLevels.map((levelId: string) => ({
            video_id: (video as any).id,
            level_id: levelId,
          })) as any
        )
    }

    return NextResponse.json({ video })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create video' },
      { status: 500 }
    )
  }
}

