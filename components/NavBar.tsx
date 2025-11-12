'use client'

import Link from 'next/link'

export function NavBar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">Caliente Dance</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/pricing" className="text-sm font-medium hover:text-primary">
            Pricing
          </Link>
          <Link href="/videos" className="text-sm font-medium hover:text-primary">
            Videos
          </Link>
        </div>
      </div>
    </nav>
  )
}
