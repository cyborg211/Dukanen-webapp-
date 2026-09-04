-- Applied to the live Dukanen Supabase project during Step 8.
-- Creates the public product image bucket and restricts writes to authenticated users' own folders.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public product images storage read" on storage.objects;
create policy "Public product images storage read"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Authenticated users upload product images" on storage.objects;
create policy "Authenticated users upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own product images" on storage.objects;
create policy "Users update own product images"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own product images" on storage.objects;
create policy "Users delete own product images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
