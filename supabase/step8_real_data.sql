-- Dukanen Step 8: real data integration
-- Run after supabase/schema.sql.

-- Product pricing flexibility used by the final UI.
alter table public.products
  add column if not exists negotiable boolean not null default false;

-- Public product-image bucket. File ownership is enforced by path + authenticated user.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

-- Storage policies are intentionally limited to the product-images bucket.
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

-- Safe view increment callable by public product pages.
create or replace function public.increment_product_views(product_uuid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set views = views + 1
  where id = product_uuid and status = 'active';
$$;

grant execute on function public.increment_product_views(uuid) to anon, authenticated;

-- Buyer/seller conversations.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (buyer_id, seller_id, product_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Participants read conversations" on public.conversations;
create policy "Participants read conversations"
on public.conversations for select
using (
  auth.uid() = buyer_id
  or exists (
    select 1 from public.sellers s
    where s.id = seller_id and s.user_id = auth.uid()
  )
);

drop policy if exists "Buyers create conversations" on public.conversations;
create policy "Buyers create conversations"
on public.conversations for insert
with check (auth.uid() = buyer_id);

drop policy if exists "Participants update conversations" on public.conversations;
create policy "Participants update conversations"
on public.conversations for update
using (
  auth.uid() = buyer_id
  or exists (
    select 1 from public.sellers s
    where s.id = seller_id and s.user_id = auth.uid()
  )
);

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages"
on public.messages for select
using (
  exists (
    select 1
    from public.conversations c
    left join public.sellers s on s.id = c.seller_id
    where c.id = conversation_id
      and (c.buyer_id = auth.uid() or s.user_id = auth.uid())
  )
);

drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages"
on public.messages for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.conversations c
    left join public.sellers s on s.id = c.seller_id
    where c.id = conversation_id
      and (c.buyer_id = auth.uid() or s.user_id = auth.uid())
  )
);

drop policy if exists "Recipients mark messages read" on public.messages;
create policy "Recipients mark messages read"
on public.messages for update
using (
  exists (
    select 1
    from public.conversations c
    left join public.sellers s on s.id = c.seller_id
    where c.id = conversation_id
      and (c.buyer_id = auth.uid() or s.user_id = auth.uid())
  )
);

create index if not exists conversations_buyer_idx on public.conversations(buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations(seller_id, last_message_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at asc);
