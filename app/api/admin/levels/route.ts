import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServiceClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('levels')
      .insert({
        name: body.name,
      })
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

