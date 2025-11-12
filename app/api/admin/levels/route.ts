import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('levels')
      .insert({
        name: body.name,
      } as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ level: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create level' },
      { status: 500 }
    )
  }
}

