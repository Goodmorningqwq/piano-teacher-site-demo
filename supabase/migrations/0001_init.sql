-- ============================================================
-- Piano teacher site — schema, row-level security, storage
-- ============================================================
-- Bilingual content uses paired `_zh` / `_en` columns. The app
-- resolves the active language and falls back to Chinese when the
-- English column is blank, so the site can launch with 中文 only.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- shared helpers ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------- admin allowlist ----------
-- Being authenticated is not enough to edit content: the account's
-- email must also appear here. Without this, anyone who can sign up
-- through Supabase Auth could write to the site.

create table public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Allowlist of emails permitted to edit site content.';

-- SECURITY DEFINER so the check itself is not blocked by RLS on admins.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- profile (singleton) ----------

create table public.profile (
  id smallint primary key default 1 check (id = 1),

  name_zh text not null default '',
  name_en text default '',
  tagline_zh text default '',
  tagline_en text default '',
  bio_zh text default '',
  bio_en text default '',
  philosophy_zh text default '',
  philosophy_en text default '',

  portrait_url text,
  -- [{ "year": "2018", "title_zh": "...", "title_en": "..." }]
  credentials jsonb not null default '[]'::jsonb,

  email text,
  phone text,
  whatsapp text,
  instagram text,
  youtube text,
  address_zh text default '',
  address_en text default '',

  updated_at timestamptz not null default now()
);

create trigger profile_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

-- ---------- courses ----------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  is_published boolean not null default true,

  title_zh text not null default '',
  title_en text default '',
  summary_zh text default '',
  summary_en text default '',
  level_zh text default '',
  level_en text default '',

  duration_min integer check (duration_min is null or duration_min between 1 and 600),
  price numeric(10, 2) check (price is null or price >= 0),
  price_note_zh text default '',
  price_note_en text default '',

  icon text default 'note',
  image_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_display_idx on public.courses (is_published, sort_order);

create trigger courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- ---------- videos ----------

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  is_published boolean not null default true,

  title_zh text not null default '',
  title_en text default '',
  description_zh text default '',
  description_en text default '',

  -- 'placeholder' is a real, deliberate state: a reserved slot the site
  -- renders as a designed "coming soon" card. It lets the video section
  -- look finished before the teacher has uploaded anything, and gives her
  -- an obvious thing to click in the admin panel.
  source_type text not null default 'placeholder'
    check (source_type in ('youtube', 'vimeo', 'upload', 'placeholder')),
  external_id text,      -- YouTube/Vimeo id when source_type is a link
  storage_path text,     -- object path in the `videos` bucket when uploaded
  poster_url text,       -- required for uploads; derived for links
  duration_sec integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A non-placeholder row must actually point at a playable video.
  constraint videos_source_complete check (
    source_type = 'placeholder'
    or (source_type in ('youtube', 'vimeo') and external_id is not null and external_id <> '')
    or (source_type = 'upload' and storage_path is not null and storage_path <> '')
  )
);

create index videos_display_idx on public.videos (is_published, sort_order);

create trigger videos_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

-- ---------- site settings (singleton) ----------

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),

  hero_headline_zh text default '',
  hero_headline_en text default '',
  hero_sub_zh text default '',
  hero_sub_en text default '',
  hero_image_url text,

  default_theme text not null default 'dark' check (default_theme in ('dark', 'light')),

  seo_title_zh text default '',
  seo_title_en text default '',
  seo_description_zh text default '',
  seo_description_en text default '',

  updated_at timestamptz not null default now()
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------- enquiries ----------

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (length(trim(name)) between 1 and 120),
  email text not null check (length(email) between 3 and 200 and position('@' in email) > 1),
  phone text check (phone is null or length(phone) <= 40),
  message text not null check (length(trim(message)) between 1 and 4000),
  is_read boolean not null default false
);

create index enquiries_inbox_idx on public.enquiries (is_read, created_at desc);

-- ============================================================
-- Row-level security
-- ============================================================

alter table public.admins        enable row level security;
alter table public.profile       enable row level security;
alter table public.courses       enable row level security;
alter table public.videos        enable row level security;
alter table public.site_settings enable row level security;
alter table public.enquiries     enable row level security;

-- admins: readable only by admins, never writable through the API.
create policy admins_select_self on public.admins
  for select to authenticated using (public.is_admin());

-- profile / site_settings: world-readable, admin-writable.
create policy profile_public_read on public.profile
  for select to anon, authenticated using (true);
create policy profile_admin_write on public.profile
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy settings_public_read on public.site_settings
  for select to anon, authenticated using (true);
create policy settings_admin_write on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- courses / videos: the public sees published rows only; admins see all.
create policy courses_public_read on public.courses
  for select to anon, authenticated using (is_published or public.is_admin());
create policy courses_admin_write on public.courses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy videos_public_read on public.videos
  for select to anon, authenticated using (is_published or public.is_admin());
create policy videos_admin_write on public.videos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- enquiries: the inverse — anyone may submit, only admins may read.
create policy enquiries_public_insert on public.enquiries
  for insert to anon, authenticated with check (true);
create policy enquiries_admin_read on public.enquiries
  for select to authenticated using (public.is_admin());
create policy enquiries_admin_update on public.enquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy enquiries_admin_delete on public.enquiries
  for delete to authenticated using (public.is_admin());

-- ============================================================
-- Grants
-- ============================================================
-- RLS decides which ROWS are visible; grants decide whether the role may
-- touch the table at all. Supabase usually applies these by default, but
-- stating them explicitly avoids the confusing case where policies are
-- correct yet every query returns "permission denied for table".

grant usage on schema public to anon, authenticated;

grant select on
  public.profile, public.courses, public.videos, public.site_settings
  to anon, authenticated;

grant insert on public.enquiries to anon, authenticated;

grant select, insert, update, delete on
  public.profile, public.courses, public.videos,
  public.site_settings, public.enquiries
  to authenticated;

grant select on public.admins to authenticated;

-- ============================================================
-- Storage
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portraits',     'portraits',     true, 5242880,   array['image/jpeg','image/png','image/webp']),
  ('course-images', 'course-images', true, 5242880,   array['image/jpeg','image/png','image/webp']),
  ('video-posters', 'video-posters', true, 5242880,   array['image/jpeg','image/png','image/webp']),
  ('videos',        'videos',        true, 209715200, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do nothing;

create policy storage_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('portraits', 'course-images', 'video-posters', 'videos'));

create policy storage_admin_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('portraits', 'course-images', 'video-posters', 'videos')
    and public.is_admin()
  );

create policy storage_admin_update on storage.objects
  for update to authenticated
  using (
    bucket_id in ('portraits', 'course-images', 'video-posters', 'videos')
    and public.is_admin()
  );

create policy storage_admin_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('portraits', 'course-images', 'video-posters', 'videos')
    and public.is_admin()
  );
