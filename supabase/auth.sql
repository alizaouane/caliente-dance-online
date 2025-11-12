-- Caliente Dance Online - Authentication Schema & RLS Policies
-- Run this SQL in your Supabase SQL Editor after running the main schema

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- Ensure profiles table exists with required columns
-- (This assumes profiles table already exists from main schema)
-- If not, uncomment and run:
/*
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
*/

-- Add email column if it doesn't exist (for backward compatibility)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'email'
  ) then
    alter table public.profiles add column email text;
  end if;
end $$;

-- Add updated_at column if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'updated_at'
  ) then
    alter table public.profiles add column updated_at timestamptz default now();
  end if;
end $$;

-- ============================================================================
-- SESSIONS AUDIT TABLE
-- ============================================================================

create table if not exists public.sessions_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event text not null, -- 'sign_in', 'sign_out', 'password_reset', etc.
  ip text,
  user_agent text,
  created_at timestamptz default now()
);

-- Index for faster queries
create index if not exists idx_sessions_audit_user_id on public.sessions_audit(user_id);
create index if not exists idx_sessions_audit_created_at on public.sessions_audit(created_at desc);

-- ============================================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing trigger if it exists
drop trigger if exists set_updated_at on public.profiles;

-- Create trigger
create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Enable RLS on sessions_audit
alter table public.sessions_audit enable row level security;

-- ============================================================================
-- RLS POLICIES: PROFILES
-- ============================================================================

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can read profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;

-- Users can view their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (id = auth.uid());

-- Users can update their own profile (but not role)
create policy "Users can update own profile"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid() 
    and (role = (select role from public.profiles where id = auth.uid()))
  );

-- Admins can read all profiles
create policy "Admins can read profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.role = 'admin'
    )
  );

-- Admins can update all profiles (including role)
create policy "Admins can update profiles"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.role = 'admin'
    )
  );

-- ============================================================================
-- RLS POLICIES: SESSIONS_AUDIT
-- ============================================================================

-- Drop existing policies if they exist
drop policy if exists "Admins can read sessions_audit" on public.sessions_audit;
drop policy if exists "Service role can insert sessions_audit" on public.sessions_audit;

-- Only admins can read audit logs
create policy "Admins can read sessions_audit"
  on public.sessions_audit
  for select
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.role = 'admin'
    )
  );

-- Service role can insert (via security definer function or direct service role calls)
-- Note: Inserts should be done via service role in API routes, not through RLS
-- This policy allows service role inserts
create policy "Service role can insert sessions_audit"
  on public.sessions_audit
  for insert
  with check (true); -- Service role bypasses RLS anyway

-- ============================================================================
-- HELPER FUNCTION: Log auth event (for use in API routes with service role)
-- ============================================================================

create or replace function public.log_auth_event(
  p_user_id uuid,
  p_event text,
  p_ip text default null,
  p_user_agent text default null
)
returns void as $$
begin
  insert into public.sessions_audit (user_id, event, ip, user_agent)
  values (p_user_id, p_event, p_ip, p_user_agent);
end;
$$ language plpgsql security definer;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Ensure authenticated users can access their own profile
grant select, update on public.profiles to authenticated;
grant select on public.sessions_audit to authenticated; -- RLS will restrict to admins

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. The handle_new_user() trigger automatically creates a profile when a user signs up
-- 2. RLS policies ensure users can only read/update their own profiles
-- 3. Admins can read/update all profiles
-- 4. Users cannot change their own role (enforced by RLS policy)
-- 5. Sessions audit is only readable by admins
-- 6. Use createServiceClient() in API routes to log auth events

