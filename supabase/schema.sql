-- Link Vault Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- 1. Main Vault Items Table
create table if not exists public.items (
  id uuid default gen_random_uuid() primary key,
  url text,
  raw_shared_text text,
  title text not null,
  description text,
  ai_summary text,
  thumbnail_url text,
  screenshot_url text,
  platform text default 'generic', -- 'github' | 'instagram' | 'youtube' | 'threads' | 'x' | 'generic'
  category text default 'AI/ML Tools', -- 'AI/ML Tools' | 'Open Source' | 'Embedded/IoT' | 'Design Inspiration' | 'Reels/Shorts' | 'Reads/Threads'
  tags text[] default '{}',
  status text default 'to_explore', -- 'to_explore' | 'explored' | 'archived'
  is_alive boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. GitHub Specific Repositories Table
create table if not exists public.github_repos (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.items(id) on delete cascade,
  repo_name text not null,
  owner text not null,
  stars integer default 0,
  forks integer default 0,
  open_issues integer default 0,
  language text,
  language_color text,
  license text,
  latest_release text,
  clone_url text,
  readme_snippet text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Code Snippets / Gists Table
create table if not exists public.code_snippets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  language text default 'typescript',
  code text not null,
  notes text,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tech Stacks / Tool Bundles Table
create table if not exists public.tech_stacks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  item_ids text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for fast search and filtering
create index if not exists items_category_idx on public.items(category);
create index if not exists items_status_idx on public.items(status);
create index if not exists items_platform_idx on public.items(platform);
create index if not exists items_created_at_idx on public.items(created_at desc);

-- Storage bucket for screenshots
insert into storage.buckets (id, name, public) 
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Enable public access for screenshots storage bucket
create policy "Public Access Screenshots"
on storage.objects for select
using ( bucket_id = 'screenshots' );

create policy "Upload Access Screenshots"
on storage.objects for insert
with check ( bucket_id = 'screenshots' );
