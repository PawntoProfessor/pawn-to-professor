create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.sections(id) on delete set null,
  title text not null,
  slug text not null unique,
  icon text default 'folder',
  description text default '',
  position integer not null default 0,
  visible boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references public.sections(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text default '',
  body text default '',
  thumbnail_url text,
  page_type text not null default 'page' check (page_type in ('page','lesson','flashcards','game','worksheet','pdf','link')),
  external_url text,
  grade text,
  duration_minutes integer,
  published boolean not null default true,
  position integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings(key,value) values
('branding', '{"siteName":"Pawn to Professor","tagline":"Plan • Teach • Play • Inspire","logoText":"♟️"}'::jsonb),
('homepage', '{"heroTitle":"Simple tools. Brighter classrooms.","heroText":"Ready-to-use EFL lessons, games, flashcards and resources — organized in one place."}'::jsonb)
on conflict (key) do nothing;

insert into public.sections(title,slug,icon,description,position) values
('Lessons','lessons','book','Ready-to-use lesson plans for elementary EFL.',1),
('Games','games','game','Interactive HTML5 classroom games.',2),
('Flashcards','flashcards','cards','Visual vocabulary cards for fast classroom practice.',3),
('Worksheets','worksheets','worksheet','Printable activities and student handouts.',4),
('Chess','chess','chess','Chess + English teaching resources.',5),
('Materials','materials','folder','Teacher resources, PDFs, posters and extras.',6)
on conflict (slug) do nothing;

alter table public.profiles enable row level security;
alter table public.sections enable row level security;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

drop policy if exists "profiles self read" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
drop policy if exists "public read sections" on public.sections;
drop policy if exists "admins manage sections" on public.sections;
drop policy if exists "public read pages" on public.pages;
drop policy if exists "admins manage pages" on public.pages;
drop policy if exists "public read settings" on public.site_settings;
drop policy if exists "admins manage settings" on public.site_settings;

create policy "profiles self read" on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "public read sections" on public.sections for select using ((visible=true and deleted_at is null) or public.is_admin());
create policy "admins manage sections" on public.sections for all using (public.is_admin()) with check (public.is_admin());
create policy "public read pages" on public.pages for select using ((published=true and deleted_at is null) or public.is_admin());
create policy "admins manage pages" on public.pages for all using (public.is_admin()) with check (public.is_admin());
create policy "public read settings" on public.site_settings for select using (true);
create policy "admins manage settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets(id,name,public) values('media','media',true) on conflict(id) do nothing;
drop policy if exists "public media read" on storage.objects;
drop policy if exists "admin media upload" on storage.objects;
drop policy if exists "admin media update" on storage.objects;
drop policy if exists "admin media delete" on storage.objects;
create policy "public media read" on storage.objects for select using (bucket_id='media');
create policy "admin media upload" on storage.objects for insert with check (bucket_id='media' and public.is_admin());
create policy "admin media update" on storage.objects for update using (bucket_id='media' and public.is_admin());
create policy "admin media delete" on storage.objects for delete using (bucket_id='media' and public.is_admin());
