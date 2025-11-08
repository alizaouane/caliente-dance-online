import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
            Caliente Dance Online
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Learn Salsa, Bachata, Kizomba & more — on demand. Premium dance class videos at your own pace.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/signup">
              <Button size="lg">Start Learning</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Caliente Dance Online?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Mobile-Friendly</CardTitle>
                <CardDescription>
                  Watch on any device, anywhere. Learn on your phone, tablet, or computer.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>All Levels</CardTitle>
                <CardDescription>
                  From beginner to advanced. Structured lessons for every skill level.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>New Classes Weekly</CardTitle>
                <CardDescription>
                  Fresh content added regularly. Keep your skills sharp with new routines.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Preview Grid */}
      <section className="container py-12 md:py-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Explore Our Dance Styles
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {['Salsa', 'Bachata', 'Kizomba'].map((style) => (
            <Card key={style} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-2xl font-bold">{style}</span>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Master {style} with our comprehensive video library. Learn at your own pace.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container py-12 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground mb-8">
            Choose the plan that works for you. Cancel anytime.
          </p>
          <Link href="/pricing">
            <Button size="lg">View Pricing Plans</Button>
          </Link>
        </div>
      </section>

      {/* FAQs */}
      <section className="container py-12 md:py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-[700px] space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Can I cancel anytime?</CardTitle>
              <CardDescription>
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What happens if I cancel?</CardTitle>
              <CardDescription>
                You&apos;ll lose access to full videos immediately after cancellation, but you can resubscribe anytime to regain access.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Do you offer refunds?</CardTitle>
              <CardDescription>
                We offer a 7-day money-back guarantee for new subscribers. Contact support for assistance.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Can I watch on multiple devices?</CardTitle>
              <CardDescription>
                Yes, you can access your account from any device. Your progress is synced across all devices.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12 md:py-24 bg-primary text-primary-foreground rounded-lg my-12">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Dancing?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of students learning to dance with Caliente Dance Online.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">Get Started Today</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

