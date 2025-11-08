import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
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
      })
      .select()
      .single()

    if (error) throw error

    // Update styles
    if (body.selectedStyles?.length > 0) {
      await supabase
        .from('video_styles')
        .insert(
          body.selectedStyles.map((styleId: string) => ({
            video_id: video.id,
            style_id: styleId,
          }))
        )
    }

    // Update levels
    if (body.selectedLevels?.length > 0) {
      await supabase
        .from('video_levels')
        .insert(
          body.selectedLevels.map((levelId: string) => ({
            video_id: video.id,
            level_id: levelId,
          }))
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

