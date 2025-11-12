import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('styles')
      .insert({
        name: body.name,
        slug: body.slug,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ style: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create style' },
      { status: 500 }
    )
  }
}

