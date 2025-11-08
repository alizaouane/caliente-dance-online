# Caliente Dance Online

A production-ready SaaS video membership platform for dance classes, built with Next.js 14, Supabase, and Stripe.

## Features

- 🎥 **Video Library**: Categorized by dance style and skill level
- 💳 **Stripe Subscriptions**: Monthly and yearly plans
- 🔐 **Authentication**: Email/password and OAuth (Google) via Supabase
- 👥 **Member Portal**: Browse, search, and watch videos
- 🛡️ **Access Control**: Subscription-based video access with previews
- 📊 **Admin Dashboard**: Manage videos, styles, levels, and subscribers
- 🎨 **Customizable Branding**: Easy theme customization via CSS variables

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Styling**: TailwindCSS + shadcn/ui
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase project
- A Stripe account
- A Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd caliente-dance-online
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase.sql`
3. Go to Storage and create three buckets:
   - `videos` (private)
   - `thumbnails` (public)
   - `previews` (private)
4. Get your project URL and API keys from Settings > API

### 3. Set Up Stripe

1. Create products in Stripe Dashboard:
   - Monthly plan (e.g., $19.99/month)
   - Yearly plan (e.g., $199.99/year)
2. Copy the Price IDs (starts with `price_...`)
3. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Copy the webhook signing secret

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep secret!)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY`: Monthly plan price ID
- `NEXT_PUBLIC_STRIPE_PRICE_YEARLY`: Yearly plan price ID
- `NEXT_PUBLIC_SITE_URL`: Your site URL (http://localhost:3000 for local)

### 5. Seed Database

Run the seed script to create default styles and levels:

```bash
npm run seed
```

### 6. Create Admin User

1. Sign up for an account through the app
2. In Supabase Dashboard, go to Table Editor > `profiles`
3. Find your user and set `role` to `'admin'`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin dashboard routes
│   ├── (auth)/            # Authentication pages
│   ├── (marketing)/       # Public marketing pages
│   ├── (member)/          # Member portal routes
│   └── api/               # API routes
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
├── scripts/              # Seed and utility scripts
├── styles/               # Global styles and theme
└── types/                # TypeScript type definitions
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

### Environment Variables in Vercel

Make sure to add all variables from `.env.example` in your Vercel project settings.

### Supabase Storage Buckets

Ensure your storage buckets are configured correctly:
- `videos`: Private bucket for full video files
- `thumbnails`: Public bucket for video thumbnails
- `previews`: Private bucket for 30-second previews

## Customization

### Brand Colors

Edit `styles/theme.css` to change brand colors:

```css
:root {
  --brand-primary: #E02424;    /* Your primary color */
  --brand-secondary: #111827;  /* Your secondary color */
  --brand-accent: #F59E0B;     /* Your accent color */
  --brand-bg: #0B0B0B;         /* Background color */
  --brand-fg: #FFFFFF;         /* Foreground color */
}
```

## Features in Detail

### Member Features

- Browse videos by style and level
- Search across video library
- Watch full videos with active subscription
- 30-second previews for non-members
- Account management and billing portal

### Admin Features

- Dashboard with KPIs (subscribers, revenue, views)
- Video management (create, edit, publish)
- Style and level management
- Subscriber list with Stripe sync
- Analytics (basic)

## Security

- Row Level Security (RLS) enabled on all tables
- Admin routes protected by middleware
- Member routes require authentication
- Video access controlled by subscription status
- Service role key only used in API routes

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.

