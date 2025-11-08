import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } from '@/lib/stripe'
import { PricingCard } from '@/components/PricingCard'

export const dynamic = 'force-dynamic'

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-24">
      <div className="mx-auto max-w-[980px]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing</h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that works for you. All plans include full access to our video library.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <PricingCard
            name="Monthly"
            price="$19.99"
            period="per month"
            priceId={STRIPE_PRICE_MONTHLY}
            features={[
              'Full access to all videos',
              'New classes added weekly',
              'All dance styles',
              'All skill levels',
              'Mobile-friendly',
              'Cancel anytime',
            ]}
            popular={false}
          />
          <PricingCard
            name="Yearly"
            price="$199.99"
            period="per year"
            priceId={STRIPE_PRICE_YEARLY}
            features={[
              'Full access to all videos',
              'New classes added weekly',
              'All dance styles',
              'All skill levels',
              'Mobile-friendly',
              'Cancel anytime',
              'Save 17% vs monthly',
            ]}
            popular={true}
          />
        </div>

        <div className="mt-12 text-center text-muted-foreground">
          <p>All plans include a 7-day money-back guarantee.</p>
        </div>
      </div>
    </div>
  )
}

