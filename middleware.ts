import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // No authentication checks - all routes are public
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
