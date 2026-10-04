create extension if not exists pgcrypto;
create table if not exists public.content(
 id uuid primary key default gen_random_uuid(), title text not null,
 type text not null default 'movie' check(type in('movie','series','short','live')),
 genre text, description text, poster_url text, video_url text,
 access_type text not null default 'free' check(access_type in('free','premium')),
 status text not null default 'draft' check(status in('draft','published')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text, role text not null default 'viewer' check(role in('viewer','admin')),
 created_at timestamptz not null default now());
alter table public.content enable row level security;
alter table public.profiles enable row level security;
create policy "published content readable" on public.content for select using(status='published');
create policy "admins manage content" on public.content for all to authenticated
using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'))
with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "users read own profile" on public.profiles for select to authenticated using(id=auth.uid());
-- After creating the first admin in Auth, run:
-- insert into public.profiles(id,full_name,role) values('YOUR_AUTH_USER_UUID','SS PLAY Admin','admin');
-- NEVER put a service_role/secret key in browser code.