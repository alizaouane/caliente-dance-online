import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : (null as any) // Will be set at runtime in API routes

export const STRIPE_PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!
export const STRIPE_PRICE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY!

