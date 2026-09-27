-- =========================================================================
-- Azam Market Online — 14: Storage buckets for logos, covers & catalogue PDFs
-- =========================================================================
-- Three public-read buckets, one per asset kind. Objects are keyed
-- "<vendor_id>/<filename>" so ownership can be checked with the same
-- owns_vendor() helper already used for products/catalogues/etc (migration
-- 09). Public read means anyone can view/download the file by URL (that's
-- the point — buyers browsing the directory need to see logos/covers and
-- download catalogue PDFs without logging in); write access is still
-- locked to the owning vendor or an admin.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vendor-logos', 'vendor-logos', true, 10485760, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('vendor-covers', 'vendor-covers', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('catalogue-pdfs', 'catalogue-pdfs', true, 26214400, array['application/pdf'])
on conflict (id) do nothing;

-- storage.objects already has RLS enabled by default in Supabase projects.
-- (storage.foldername(name))[1] is the first path segment -- the vendor_id
-- folder every upload from the app is written into.

create policy "vendor_logos_public_read" on storage.objects
  for select using (bucket_id = 'vendor-logos');

create policy "vendor_logos_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'vendor-logos'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );

create policy "vendor_logos_owner_update" on storage.objects
  for update using (
    bucket_id = 'vendor-logos'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );

create policy "vendor_logos_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'vendor-logos'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );

create policy "vendor_covers_public_read" on storage.objects
  for select using (bucket_id = 'vendor-covers');

create policy "vendor_covers_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'vendor-covers'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );

create policy "vendor_covers_owner_update" on storage.objects
  for update using (
    bucket_id = 'vendor-covers'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );

create policy "vendor_covers_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'vendor-covers'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );

create policy "catalogue_pdfs_public_read" on storage.objects
  for select using (bucket_id = 'catalogue-pdfs');

create policy "catalogue_pdfs_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'catalogue-pdfs'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );

create policy "catalogue_pdfs_owner_update" on storage.objects
  for update using (
    bucket_id = 'catalogue-pdfs'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );

create policy "catalogue_pdfs_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'catalogue-pdfs'
    and (owns_vendor(((storage.foldername(name))[1])::uuid) or is_admin())
  );
