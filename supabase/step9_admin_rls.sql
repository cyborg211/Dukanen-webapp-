-- Applied to the connected Dukanen Supabase project during Step 9.
-- Restores trustworthy admin dashboard visibility without exposing private profile rows to ordinary users.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.profiles
    where id=auth.uid() and role='admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "Admin profiles read" on public.profiles;
create policy "Admin profiles read" on public.profiles
for select to authenticated
using (private.is_admin());

drop policy if exists "Admin products read" on public.products;
create policy "Admin products read" on public.products
for select to authenticated
using (private.is_admin());

drop policy if exists "Admin orders read" on public.orders;
create policy "Admin orders read" on public.orders
for select to authenticated
using (private.is_admin());

drop policy if exists "Admin reports read" on public.reports;
create policy "Admin reports read" on public.reports
for select to authenticated
using (private.is_admin());

drop policy if exists "Admin reports update" on public.reports;
create policy "Admin reports update" on public.reports
for update to authenticated
using (private.is_admin())
with check (private.is_admin());
