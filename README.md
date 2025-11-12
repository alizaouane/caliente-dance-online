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
2. Go to SQL Editor and run the contents of `supabase.sql` (main schema)
3. Run the contents of `supabase/auth.sql` (authentication schema and RLS policies)
4. Go to Storage and create three buckets:
   - `videos` (private)
   - `thumbnails` (public)
   - `previews` (private)
5. Get your project URL and API keys from Settings > API

#### Authentication Setup

1. **Configure Authentication Providers**:
   - Go to Authentication > Providers in Supabase Dashboard
   - Enable Email provider (already enabled by default)
   - For Google OAuth:
     - Enable Google provider
     - Add your Google OAuth credentials (Client ID and Secret)
     - Add authorized redirect URLs: `http://localhost:3000/auth/callback` (dev) and your production URL

2. **Email Configuration**:
   - Go to Authentication > URL Configuration
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://your-production-domain.com/auth/callback` (production)
   - Enable "Enforce email confirmations" for production
   - Configure password reset email templates

3. **JWT Settings**:
   - Go to Authentication > Settings
   - Set JWT expiry to 1 hour (default)
   - Enable refresh token rotation
   - Enable "Revoke refresh token on sign out"

4. **Rate Limiting**:
   - Enable rate limiting for sign-in/sign-up endpoints
   - Recommended: 5 requests per minute per IP

5. **Security Settings**:
   - Disable "Allow users to change email without re-authentication"
   - Require recent login for sensitive changes
   - Enable MFA (optional but recommended for admins)

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

**Required variables:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep secret! Never expose to client)
- `NEXT_PUBLIC_SITE_URL`: Your site URL (http://localhost:3000 for local, https://your-domain.com for production)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `STRIPE_PRICE_MONTHLY`: Monthly plan price ID
- `STRIPE_PRICE_YEARLY`: Yearly plan price ID

**Optional variables:**
- `AUTH_REDIRECT_URLS`: Comma-separated list of allowed redirect URLs (for additional validation)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (if using Google sign-in)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (if using Google sign-in)
- `SMTP_*`: SMTP configuration for custom email sending (optional, Supabase handles emails by default)

### 5. Seed Database

Run the seed script to create default styles and levels:

```bash
npm run seed
```

### 6. Create Admin User

1. Sign up for an account through the app at `/signup`
2. Confirm your email (if email confirmation is enabled)
3. In Supabase Dashboard, go to Table Editor > `profiles`
4. Find your user by email and set `role` to `'admin'`

Alternatively, use SQL:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

After setting the role, sign out and sign back in to see the Admin link in the navigation.

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

## Authentication

The app uses Supabase Auth with the following features:

### Supported Sign-In Methods

1. **Email/Password**: Traditional email and password authentication
2. **Magic Link**: Passwordless authentication via email link
3. **OAuth (Google)**: Sign in with Google account

### Authentication Flow

1. **Sign Up**: Users create accounts via `/signup`
   - Profile is automatically created via database trigger
   - Email confirmation required (configurable in Supabase)

2. **Sign In**: Users sign in via `/signin`
   - Supports email/password, magic link, or OAuth
   - Redirects to intended destination after authentication

3. **Session Management**:
   - Sessions stored in httpOnly cookies (secure in production)
   - Automatic token refresh
   - Sign out clears session and revokes refresh token

### Route Protection

- **Public Routes**: `/`, `/pricing`, `/signin`, `/signup`, `/reset-password`
- **Member Routes**: `/videos`, `/account`, `/search` (require authentication)
- **Admin Routes**: `/admin/**` (require authentication AND admin role)

### Row Level Security (RLS)

All database tables have RLS enabled with the following policies:

- **Profiles**: Users can read/update only their own profile. Admins can read/update all profiles.
- **Sessions Audit**: Only admins can read audit logs. Inserts via service role.
- **Other tables**: Follow similar patterns based on user role and ownership.

### Security Best Practices

- ✅ Service role key only used in server-side API routes
- ✅ No client-side exposure of sensitive keys
- ✅ RLS policies enforce data access at database level
- ✅ Middleware provides additional route protection
- ✅ Secure cookies (httpOnly, sameSite=lax, secure in production)
- ✅ Input validation with Zod on all auth endpoints
- ✅ Auth events logged to `sessions_audit` table

## Security

- Row Level Security (RLS) enabled on all tables
- Admin routes protected by middleware and layout guards
- Member routes require authentication (middleware + layout)
- Video access controlled by subscription status
- Service role key only used in API routes (never in client bundles)
- Secure cookie configuration for production
- Input validation on all auth endpoints
- Auth event logging for audit trails

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

