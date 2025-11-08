# Vercel Deployment Guide

## Recommended Setup

**Development Workflow:**
- **Local Development**: Use `npm run dev` for active coding (faster, instant feedback)
- **Vercel Preview**: Automatic deployments for each branch/PR (testing)
- **Vercel Production**: Main deployment for staging/production

## Step 1: Push to GitHub

First, make sure your code is in a Git repository:

```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit - Caliente Dance Online"

# Create a repo on GitHub, then:
git remote add origin https://github.com/yourusername/caliente-dance-online.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. **Configure Environment Variables** (see below)
6. Click **"Deploy"**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# For production
vercel --prod
```

## Step 3: Configure Environment Variables in Vercel

**Critical:** You must add all environment variables in Vercel Dashboard!

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL
https://cdrmsqpxouzodkwxcyhk.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcm1zcXB4b3V6b2Rrd3hjeWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTUxNzQsImV4cCI6MjA3ODE5MTE3NH0.UB7ynqBIfBQys5LgkGB3DOBn2uwe3Lz7drnrb7maB10

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcm1zcXB4b3V6b2Rrd3hjeWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYxNTE3NCwiZXhwIjoyMDc4MTkxMTc0fQ.XEl4FYooqld7q2rJlZDUoHBh3MgfKaMfR_pxi9jvfck

NEXT_PUBLIC_SITE_URL
https://your-project.vercel.app
(Update this after first deployment with your actual Vercel URL)

STRIPE_SECRET_KEY
(Add when you set up Stripe)

STRIPE_WEBHOOK_SECRET
(Add when you set up Stripe)

NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
(Add when you set up Stripe)

NEXT_PUBLIC_STRIPE_PRICE_YEARLY
(Add when you set up Stripe)
```

**Important:**
- Set each variable for **Production**, **Preview**, and **Development** environments
- `NEXT_PUBLIC_SITE_URL` should be your Vercel deployment URL (e.g., `https://caliente-dance.vercel.app`)

## Step 4: Update Stripe Webhook (After Deployment)

Once deployed, update your Stripe webhook:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://your-project.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 5: Update Supabase Auth Settings

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://your-project.vercel.app`
3. Add to **Redirect URLs**: 
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**`

## Deployment Workflow

### Automatic Deployments

- **Main branch** → Production deployment
- **Other branches** → Preview deployments (great for testing!)
- **Pull Requests** → Preview deployments with unique URLs

### Manual Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Testing Your Deployment

After deployment:

1. ✅ Visit your Vercel URL
2. ✅ Test sign up / sign in
3. ✅ Test admin dashboard (after setting admin role)
4. ✅ Test Stripe checkout (when configured)
5. ✅ Test video playback (when videos are uploaded)

## Troubleshooting

**Build fails:**
- Check build logs in Vercel Dashboard
- Ensure all environment variables are set
- Verify TypeScript errors: `npm run type-check`

**Environment variables not working:**
- Make sure they're set for the correct environment (Production/Preview)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

**Auth not working:**
- Verify Supabase redirect URLs include your Vercel domain
- Check `NEXT_PUBLIC_SITE_URL` matches your Vercel URL

**Stripe webhook not working:**
- Verify webhook URL in Stripe matches your Vercel deployment
- Check webhook secret is set correctly in Vercel
- Test with Stripe CLI locally first

## Best Practices

1. **Use Preview Deployments**: Test changes in preview before merging to main
2. **Environment Variables**: Keep sensitive keys secure, never commit to Git
3. **Branch Strategy**: Use feature branches → preview → merge to main → production
4. **Monitoring**: Set up Vercel Analytics and error tracking

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure Vercel Analytics
3. Set up error monitoring (Sentry, etc.)
4. Configure automatic backups for Supabase
5. Set up staging environment (separate Vercel project)

