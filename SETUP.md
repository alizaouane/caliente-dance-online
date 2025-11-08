# Quick Setup Guide

Follow these steps to get Caliente Dance Online running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Run SQL**: Copy the contents of `supabase.sql` and run it in the SQL Editor
3. **Create Storage Buckets**:
   - Go to Storage
   - Create bucket: `videos` (private)
   - Create bucket: `thumbnails` (public)
   - Create bucket: `previews` (private)
4. **Get Keys**: Go to Settings > API and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

## 3. Set Up Stripe

1. **Create Products**:
   - Monthly: $19.99/month (or your price)
   - Yearly: $199.99/year (or your price)
2. **Copy Price IDs**: They start with `price_...`
3. **Set Up Webhook**:
   - Endpoint: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook signing secret (starts with `whsec_...`)

## 4. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 5. Seed Database

```bash
npm run seed
```

This creates default styles (Salsa, Bachata, Kizomba) and levels (Beginner, Intermediate, Advanced).

## 6. Create Admin User

1. Start the dev server: `npm run dev`
2. Sign up at `http://localhost:3000/signup`
3. In Supabase Dashboard > Table Editor > `profiles`:
   - Find your user
   - Set `role` = `'admin'`

## 7. Test

1. Visit `http://localhost:3000`
2. Sign in as admin
3. Go to `/admin` to access dashboard
4. Create a test video
5. Test subscription flow

## Next Steps

- Upload video files to Supabase Storage
- Customize brand colors in `styles/theme.css`
- Set up production environment variables in Vercel
- Configure Stripe webhook for production

## Troubleshooting

**"Missing environment variables"**: Make sure `.env.local` exists and has all required variables.

**"RLS policy violation"**: Check that you've run the SQL from `supabase.sql`.

**"Cannot access admin"**: Make sure you've set `role = 'admin'` in the profiles table.

**"Stripe checkout not working"**: Verify your price IDs are correct and Stripe is in test mode.

