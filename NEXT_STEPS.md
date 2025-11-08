# Next Steps - Getting Caliente Dance Online Running

## ✅ Completed
- [x] Project structure created
- [x] All dependencies installed
- [x] Codebase ready (no linting errors)

## 🚀 Immediate Next Steps

### 1. Set Up Supabase (15-20 minutes)

**Create Project:**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for project to initialize (takes ~2 minutes)

**Run Database Schema:**
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `supabase.sql`
4. Paste and click **Run**
5. Verify tables were created (check Table Editor)

**Create Storage Buckets:**
1. Go to **Storage** in sidebar
2. Create bucket: `videos` (set to **Private**)
3. Create bucket: `thumbnails` (set to **Public**)
4. Create bucket: `previews` (set to **Private**)

**Get API Keys:**
1. Go to **Settings** > **API**
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

### 2. Set Up Stripe (10-15 minutes)

**Create Products:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) (use Test mode)
2. **Products** > **Add Product**
3. Create Monthly plan:
   - Name: "Caliente Monthly"
   - Price: $19.99/month (or your price)
   - Copy the **Price ID** (starts with `price_...`)
4. Create Yearly plan:
   - Name: "Caliente Yearly"
   - Price: $199.99/year (or your price)
   - Copy the **Price ID**

**Get API Keys:**
1. Go to **Developers** > **API keys**
2. Copy **Secret key** (starts with `sk_test_...`)

**Set Up Webhook (for local testing):**
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) or see [docs](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret (starts with `whsec_...`)

**For Production:**
1. In Stripe Dashboard > **Developers** > **Webhooks**
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret

### 3. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_...

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Seed Database

```bash
npm run seed
```

This creates:
- Dance styles: Salsa, Bachata, Kizomba
- Levels: Beginner, Intermediate, Advanced

### 5. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 6. Create Admin User

1. Go to http://localhost:3000/signup
2. Create an account
3. In Supabase Dashboard > **Table Editor** > `profiles`
4. Find your user row
5. Click edit and set `role` = `'admin'`
6. Save

### 7. Test the App

**Test Public Pages:**
- [ ] Landing page loads
- [ ] Pricing page shows plans
- [ ] Sign up works
- [ ] Sign in works

**Test Admin (after setting role):**
- [ ] Can access `/admin`
- [ ] Dashboard shows KPIs
- [ ] Can create a style
- [ ] Can create a level
- [ ] Can create a video (metadata only for now)

**Test Member Features:**
- [ ] Can browse videos (if any exist)
- [ ] Can search videos
- [ ] Video player shows preview/subscribe CTA

**Test Stripe:**
- [ ] Click "Get Started" on pricing page
- [ ] Stripe checkout opens
- [ ] Complete test payment
- [ ] Webhook updates subscription in database
- [ ] Can access full videos after subscription

## 🔧 Optional Enhancements

### Video Upload
Currently, video uploads need to be done manually in Supabase Storage. To add upload UI:
- Create `/app/api/admin/storage/upload/route.ts`
- Add file upload component to VideoForm
- Handle video processing/transcoding if needed

### Onboarding Flow
Add onboarding after signup:
- Collect name, dance interests, preferred level
- Update profile with this data

### Analytics Improvements
- Add more detailed analytics
- Track video completion rates
- User engagement metrics

### Email Notifications
- Welcome emails
- Subscription confirmations
- New video notifications

## 🐛 Troubleshooting

**"Module not found" errors:**
- Run `npm install` again
- Delete `node_modules` and `.next`, then reinstall

**Supabase connection errors:**
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are set (from `supabase.sql`)

**Stripe errors:**
- Verify you're using test mode keys
- Check price IDs are correct
- Ensure webhook secret matches

**Admin access denied:**
- Verify `role = 'admin'` in profiles table
- Check middleware is working
- Try signing out and back in

**Video not playing:**
- Check video file is uploaded to Storage
- Verify bucket permissions
- Check signed URL generation

## 📝 Notes

- **Supabase Auth Helpers**: Currently using deprecated `@supabase/auth-helpers-nextjs`. Consider migrating to `@supabase/ssr` in the future.
- **Stripe API Version**: Update in `lib/stripe.ts` if needed (currently `2024-11-20.acacia`)
- **Video Processing**: For production, consider adding video transcoding (e.g., Mux, Cloudflare Stream)
- **Image Optimization**: Consider using Next.js Image optimization or a CDN for thumbnails

## 🚢 Deployment Checklist

When ready to deploy:

1. **Vercel Setup:**
   - Push code to GitHub
   - Import project in Vercel
   - Add all environment variables
   - Deploy

2. **Update Environment:**
   - Change `NEXT_PUBLIC_SITE_URL` to production URL
   - Use production Stripe keys
   - Update Stripe webhook to production URL

3. **Supabase:**
   - Verify production database has schema
   - Set up production storage buckets
   - Configure production auth settings

4. **Testing:**
   - Test full subscription flow
   - Verify webhooks work
   - Test admin functions
   - Check mobile responsiveness

---

**Need help?** Check the main `README.md` for more details or open an issue.

