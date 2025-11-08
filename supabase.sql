-- Caliente Dance Online - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (1-1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  interests text[] default '{}',
  preferred_level text check (preferred_level in ('Beginner','Intermediate','Advanced')),
  role text default 'member' check (role in ('member','admin')),
  created_at timestamptz default now()
);

-- Subscription state mirrored from Stripe
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text,               -- active, trialing, past_due, canceled, etc.
  price_id text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Dance Styles taxonomy
create table public.styles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  position int default 0,
  created_at timestamptz default now()
);

-- Levels taxonomy
create table public.levels (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, -- Beginner, Intermediate, Advanced
  position int default 0,
  created_at timestamptz default now()
);

-- Videos
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  duration_seconds int,
  teacher text,
  published boolean default false,
  video_path text,       -- storage path
  preview_path text,     -- 30s preview
  thumbnail_path text,   -- storage thumb
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Video ↔ Style many-to-many
create table public.video_styles (
  video_id uuid references public.videos(id) on delete cascade,
  style_id uuid references public.styles(id) on delete cascade,
  primary key (video_id, style_id)
);

-- Video ↔ Level many-to-many
create table public.video_levels (
  video_id uuid references public.videos(id) on delete cascade,
  level_id uuid references public.levels(id) on delete cascade,
  primary key (video_id, level_id)
);

-- Simple analytics - video views
create table public.video_views (
  id bigserial primary key,
  video_id uuid references public.videos(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  viewed_at timestamptz default now()
);

-- Indexes for performance
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_customer_id on public.subscriptions(stripe_customer_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_videos_published on public.videos(published);
create index idx_videos_created_at on public.videos(created_at desc);
create index idx_video_styles_video_id on public.video_styles(video_id);
create index idx_video_styles_style_id on public.video_styles(style_id);
create index idx_video_levels_video_id on public.video_levels(video_id);
create index idx_video_levels_level_id on public.video_levels(level_id);
create index idx_video_views_video_id on public.video_views(video_id);
create index idx_video_views_user_id on public.video_views(user_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.styles enable row level security;
alter table public.levels enable row level security;
alter table public.videos enable row level security;
alter table public.video_styles enable row level security;
alter table public.video_levels enable row level security;
alter table public.video_views enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for subscriptions
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Subscriptions are written via service role (webhooks)
-- No insert/update policies for regular users

-- RLS Policies for styles (readable by all, writable by admin)
create policy "Anyone can view styles"
  on public.styles for select
  using (true);

-- Styles write policies handled via service role in admin routes

-- RLS Policies for levels (readable by all, writable by admin)
create policy "Anyone can view levels"
  on public.levels for select
  using (true);

-- Levels write policies handled via service role in admin routes

-- RLS Policies for videos
create policy "Anyone can view published videos"
  on public.videos for select
  using (published = true);

create policy "Admins can view all videos"
  on public.videos for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Video write policies handled via service role in admin routes

-- RLS Policies for video_styles
create policy "Anyone can view video styles"
  on public.video_styles for select
  using (true);

-- RLS Policies for video_levels
create policy "Anyone can view video levels"
  on public.video_levels for select
  using (true);

-- RLS Policies for video_views
create policy "Users can insert their own views"
  on public.video_views for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Admins can view all views"
  on public.video_views for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

create trigger update_videos_updated_at
  before update on public.videos
  for each row execute procedure public.handle_updated_at();

