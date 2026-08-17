-- ============================================================
-- Storage buckets and policies
-- ============================================================
-- Kept separate from 0001 on purpose.
--
-- The Supabase SQL editor runs a script inside a transaction, and
-- `storage.objects` is owned by `supabase_storage_admin` rather than
-- `postgres`. If creating a policy on it raises
--   42501: must be owner of table objects
-- then bundling this with the schema would roll the whole schema back.
-- Isolated here, a failure costs nothing that already succeeded, and the
-- same four policies can be added from Storage → Policies in the
-- dashboard instead.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portraits',     'portraits',     true, 5242880,   array['image/jpeg','image/png','image/webp']),
  ('course-images', 'course-images', true, 5242880,   array['image/jpeg','image/png','image/webp']),
  ('video-posters', 'video-posters', true, 5242880,   array['image/jpeg','image/png','image/webp']),
  ('videos',        'videos',        true, 209715200, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do nothing;

-- Re-runnable: drop first so a partial earlier attempt is not an error.
drop policy if exists storage_public_read   on storage.objects;
drop policy if exists storage_admin_write   on storage.objects;
drop policy if exists storage_admin_update  on storage.objects;
drop policy if exists storage_admin_delete  on storage.objects;

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
