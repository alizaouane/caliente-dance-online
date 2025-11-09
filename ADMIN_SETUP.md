# Admin User Setup Guide

## How Admin Visibility Works

The admin link visibility is controlled by checking the `role` field in the `profiles` table. Here's how it works:

### 1. **NavBar Component** (Client-Side Check)
- When a user logs in, the NavBar component queries the `profiles` table
- It checks if `profile.role === 'admin'`
- If true, it sets `isAdmin` state to `true` and shows the "Admin" link
- The check happens in `components/NavBar.tsx` lines 20-28 and 37-45

### 2. **Account Page** (Server-Side Check)
- The Account page uses the `isAdmin()` function from `lib/auth.ts`
- This function queries the database server-side to check the role
- If admin, it displays an "Admin" card with a link to the dashboard

### 3. **Middleware Protection** (Route Protection)
- The `middleware.ts` file protects all `/admin/*` routes
- It checks if the user is authenticated AND has `role = 'admin'`
- Non-admin users are redirected to the home page
- This prevents unauthorized access even if someone tries to access `/admin` directly

### 4. **Database Schema**
- The `profiles` table has a `role` field with a check constraint
- Valid values: `'member'` (default) or `'admin'`
- See `supabase.sql` line 14: `role text default 'member' check (role in ('member','admin'))`

## How to Create an Admin User

### Method 1: Using Supabase Dashboard (Recommended)

1. **Sign up for an account** (if you haven't already):
   - Go to your app's signup page: `https://your-app.vercel.app/signup`
   - Create an account with your email

2. **Find your User ID**:
   - Go to Supabase Dashboard → Authentication → Users
   - Find your user by email
   - Copy the User ID (UUID)

3. **Update the profile**:
   - Go to Supabase Dashboard → Table Editor → `profiles`
   - Find the row with your User ID (or search by email if you can see it)
   - Click to edit the row
   - Change the `role` field from `'member'` to `'admin'`
   - Save the changes

### Method 2: Using SQL (Faster)

1. **Sign up for an account** (if you haven't already)

2. **Get your User ID**:
   - Go to Supabase Dashboard → Authentication → Users
   - Find your user and copy the User ID

3. **Run this SQL** in Supabase SQL Editor:

```sql
-- Replace 'YOUR_USER_ID_HERE' with your actual User ID
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID_HERE';
```

Or if you know your email:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

### Method 3: Create Admin User Directly via SQL

If you want to create an admin user directly in the database:

```sql
-- First, create the auth user (you'll need to set a password manually in Supabase Dashboard)
-- Then create the profile with admin role
INSERT INTO public.profiles (id, role, full_name)
VALUES (
  'USER_ID_FROM_AUTH_USERS',
  'admin',
  'Admin User'
);
```

## Verify Admin Access

After setting your role to admin:

1. **Sign out** of your app (if you're already signed in)
2. **Sign in again** (this refreshes your session)
3. You should now see:
   - An "Admin" link in the navigation bar
   - An "Admin" card on the Account page (`/account`)
   - Access to `/admin` dashboard

## Troubleshooting

### Admin link not showing?

1. **Check your role in the database**:
   ```sql
   SELECT id, role FROM public.profiles WHERE id = 'YOUR_USER_ID';
   ```
   Should return `role = 'admin'`

2. **Sign out and sign in again** - The NavBar checks the role on login

3. **Check browser console** - Look for any errors when loading the profile

4. **Verify RLS policies** - Make sure you can read your own profile:
   ```sql
   -- This should return your profile
   SELECT * FROM public.profiles WHERE id = auth.uid();
   ```

### Can't access `/admin` route?

1. **Check middleware logs** - The middleware will redirect non-admins
2. **Verify your session** - Make sure you're signed in
3. **Check the profile role** - Must be exactly `'admin'` (case-sensitive)

## Security Notes

- The `role` field is protected by Row Level Security (RLS)
- Only admins can update other users' roles (see RLS policies in `supabase.sql`)
- Users can read their own profile but cannot change their own role
- The middleware provides an additional layer of protection for admin routes

## Multiple Admin Users

To create multiple admin users, simply repeat the process for each user:

```sql
-- Make multiple users admin by email
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com'
  )
);
```

