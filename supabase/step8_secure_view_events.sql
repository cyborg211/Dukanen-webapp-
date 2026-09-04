-- Replaces the earlier public SECURITY DEFINER view-counter RPC.
-- Public pages can only insert a view event; the private trigger increments products.views.

create table if not exists public.product_view_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.product_view_events enable row level security;

drop policy if exists "Record active product views" on public.product_view_events;
create policy "Record active product views"
on public.product_view_events for insert to anon,authenticated
with check (
  exists(select 1 from public.products p where p.id=product_id and p.status='active')
  and (viewer_id is null or viewer_id=auth.uid())
);

create or replace function public.increment_product_views_from_event()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  update public.products set views=views+1 where id=new.product_id and status='active';
  return new;
end;
$$;

revoke all on function public.increment_product_views_from_event() from public,anon,authenticated;

drop trigger if exists product_view_event_increment on public.product_view_events;
create trigger product_view_event_increment
after insert on public.product_view_events
for each row execute function public.increment_product_views_from_event();

drop function if exists public.increment_product_views(uuid);

create index if not exists product_view_events_product_idx on public.product_view_events(product_id,created_at desc);
create index if not exists product_view_events_viewer_idx on public.product_view_events(viewer_id,created_at desc);
