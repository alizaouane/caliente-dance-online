'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PricingCardProps {
  name: string
  price: string
  period: string
  priceId: string
  features: string[]
  popular?: boolean
}

export function PricingCard({
  name,
  price,
  period,
  priceId,
  features,
  popular = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setLoading(false)
    }
  }

  return (
    <Card className={popular ? 'border-primary border-2' : ''}>
      {popular && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold rounded-t-lg">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground ml-2">{period}</span>
        </div>
        <CardDescription className="mt-4">
          Perfect for {name === 'Monthly' ? 'trying out' : 'committed learners'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  )
}

