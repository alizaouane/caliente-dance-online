# Supabase Setup Guide

## Step 1: Run the SQL Schema

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase.sql` (or see below)
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is normal!

The SQL will create:
- ✅ All database tables
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for auto-creating profiles and updating timestamps
- ✅ Functions for data integrity

## Step 2: Create Storage Buckets

1. Go to **Storage** in the left sidebar
2. Click **New bucket** and create these three buckets:

### Bucket 1: `videos`
- **Name**: `videos`
- **Public bucket**: ❌ **Unchecked** (Private)
- **File size limit**: 500 MB (or your preference)
- **Allowed MIME types**: `video/*` (optional, for validation)

### Bucket 2: `thumbnails`
- **Name**: `thumbnails`
- **Public bucket**: ✅ **Checked** (Public)
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/*`

### Bucket 3: `previews`
- **Name**: `previews`
- **Public bucket**: ❌ **Unchecked** (Private)
- **File size limit**: 50 MB
- **Allowed MIME types**: `video/*`

## Step 3: Set Storage Policies (Optional but Recommended)

For the `videos` and `previews` buckets, you may want to add policies to allow authenticated users to read files. However, the app uses signed URLs, so this is optional.

If you want to add policies:

1. Go to **Storage** > Select a bucket > **Policies**
2. Click **New Policy**
3. For `videos` bucket:
   - Policy name: "Authenticated users can read videos"
   - Allowed operation: SELECT
   - Policy definition:
   ```sql
   (bucket_id = 'videos'::text) AND (auth.role() = 'authenticated'::text)
   ```

4. For `previews` bucket:
   - Policy name: "Anyone can read previews"
   - Allowed operation: SELECT
   - Policy definition:
   ```sql
   bucket_id = 'previews'::text
   ```

**Note**: The app uses signed URLs for private content, so these policies are optional. The current implementation should work without them.

## Step 4: Get Your API Keys

1. Go to **Settings** > **API**
2. Copy these values for your `.env.local`:

   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

## Step 5: Verify Setup

After running the SQL, verify everything was created:

1. Go to **Table Editor** - you should see these tables:
   - ✅ `profiles`
   - ✅ `subscriptions`
   - ✅ `styles`
   - ✅ `levels`
   - ✅ `videos`
   - ✅ `video_styles`
   - ✅ `video_levels`
   - ✅ `video_views`

2. Go to **Storage** - you should see:
   - ✅ `videos` bucket
   - ✅ `thumbnails` bucket
   - ✅ `previews` bucket

## Troubleshooting

**"relation already exists" error:**
- Some tables might already exist. You can either:
  - Drop existing tables first (be careful!)
  - Or modify the SQL to use `CREATE TABLE IF NOT EXISTS`

**"permission denied" error:**
- Make sure you're running the SQL as the project owner
- Check that RLS is enabled on the tables

**Storage bucket creation fails:**
- Make sure bucket names are lowercase and match exactly: `videos`, `thumbnails`, `previews`
- Check that you have proper permissions

## Next Steps

After completing this setup:
1. Run `npm run seed` to populate default styles and levels
2. Create your admin user (sign up, then set `role = 'admin'` in profiles table)
3. Start adding videos through the admin dashboard!

