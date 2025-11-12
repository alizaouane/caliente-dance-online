import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Authentication removed - return error
    return NextResponse.json(
      { error: 'Authentication required. Please sign in to access billing portal.' },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}

