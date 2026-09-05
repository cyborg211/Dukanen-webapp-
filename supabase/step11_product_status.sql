-- Applied to the connected Dukanen Supabase project during final QA.
-- Aligns the restored legacy products.status constraint with the seller-dashboard lifecycle.

alter table public.products
  drop constraint if exists products_status_check;

alter table public.products
  add constraint products_status_check
  check (status in ('draft','active','paused','sold','suspended'));
