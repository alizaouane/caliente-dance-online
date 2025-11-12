import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json()
    
    if (!priceId || (priceId !== STRIPE_PRICE_MONTHLY && priceId !== STRIPE_PRICE_YEARLY)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Authentication removed - return error
    return NextResponse.json(
      { error: 'Authentication required. Please sign in to subscribe.' },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

