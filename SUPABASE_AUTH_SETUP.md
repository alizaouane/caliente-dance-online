# Supabase Authentication Setup Guide

## Problem: Email Confirmation Links Not Working

When you sign up, Supabase sends a confirmation email. If the link redirects to `localhost:3000` and you get an error, it's because Supabase needs to be configured with the correct redirect URLs.

## Solution: Configure Supabase Redirect URLs

### For Local Development

1. **Go to Supabase Dashboard** → **Authentication** → **URL Configuration**

2. **Set Site URL**:
   - For local dev: `http://localhost:3000`
   - For production: `https://your-app.vercel.app`

3. **Add Redirect URLs** (add all of these):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

4. **Save the changes**

### For Production (Vercel)

1. **Update Site URL** in Supabase:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to: `https://your-app.vercel.app`

2. **Add Production Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

3. **Update Environment Variable** in Vercel:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `NEXT_PUBLIC_SITE_URL` to: `https://your-app.vercel.app`
   - Redeploy your app

## How Email Confirmation Works

1. User signs up → Supabase sends confirmation email
2. User clicks link in email → Redirects to `/auth/callback?code=...`
3. Callback route exchanges code for session → User is logged in
4. User is redirected to `/videos`

## Troubleshooting

### Error: "Email link is invalid or has expired"

**Causes:**
- The confirmation link expired (default: 1 hour)
- The redirect URL doesn't match what's configured in Supabase
- The link was clicked from a different environment

**Solutions:**
1. **Request a new confirmation email**:
   - Go to `/signin`
   - Click "Resend confirmation email" (if available)
   - Or sign up again with the same email

2. **Check Supabase redirect URLs**:
   - Make sure your production URL is in the redirect URLs list
   - Make sure `localhost:3000` is there for local development

3. **Disable email confirmation** (for testing only):
   - Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**
   - Toggle off "Confirm email" (NOT recommended for production)

### Error: "ERR_CONNECTION_REFUSED" when clicking email link

**Cause:** The email link points to `localhost:3000` but:
- Your local dev server isn't running
- You're clicking the link from a different device/network

**Solutions:**
1. **For local development**: Make sure `npm run dev` is running before clicking the link

2. **For production**: The link should point to your Vercel URL, not localhost. Check:
   - Supabase Site URL is set to your production URL
   - `NEXT_PUBLIC_SITE_URL` environment variable is set correctly in Vercel

### Email confirmation not required (for testing)

If you want to skip email confirmation during development:

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Toggle off **"Confirm email"**
3. Users will be able to sign in immediately after signup

**⚠️ Warning:** Only disable this for development/testing. Always enable it for production!

## Manual Account Confirmation

If you need to manually confirm an account:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user by email
3. Click on the user
4. Toggle **"Email Confirmed"** to ON
5. The user can now sign in

## Testing Email Confirmation

1. **Sign up** with a new email
2. **Check your email** (and spam folder)
3. **Click the confirmation link**
4. You should be redirected to `/videos` and logged in

## Best Practices

1. **Always set redirect URLs** for both local and production
2. **Use environment variables** for `NEXT_PUBLIC_SITE_URL`
3. **Keep email confirmation enabled** in production
4. **Test the flow** before deploying to production
5. **Monitor Supabase logs** if users report issues

## Quick Fix Checklist

- [ ] Supabase Site URL is set correctly
- [ ] Redirect URLs include `/auth/callback`
- [ ] `NEXT_PUBLIC_SITE_URL` environment variable is set
- [ ] Local dev server is running (for localhost links)
- [ ] Production URL is in Supabase redirect URLs (for production)
- [ ] Email confirmation is enabled (for production)

