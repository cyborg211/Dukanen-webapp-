-- Applied to the restored Dukanen Supabase project during Step 8.
-- Upgrades the legacy schema to the canonical UI/UX data model without dropping user data.

alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists image_url text;
alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete set null;
alter table public.categories add column if not exists active boolean not null default true;

alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists country text default 'South Sudan';
alter table public.profiles add column if not exists region text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists neighborhood text;
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

update public.profiles p
set email=coalesce(p.email,u.email),
    name=coalesce(nullif(p.name,''),nullif(p.full_name,''),split_part(u.email,'@',1),'Dukanen User'),
    city=coalesce(p.city,p.location),
    country=coalesce(p.country,'South Sudan'),
    updated_at=now()
from auth.users u
where u.id=p.id;

alter table public.sellers add column if not exists logo_url text;
alter table public.sellers add column if not exists cover_image_url text;
alter table public.sellers add column if not exists business_category text;
alter table public.sellers add column if not exists country text default 'South Sudan';
alter table public.sellers add column if not exists region text;
alter table public.sellers add column if not exists city text;
alter table public.sellers add column if not exists neighborhood text;
alter table public.sellers add column if not exists rating numeric(2,1) not null default 0;
alter table public.sellers add column if not exists review_count integer not null default 0;
alter table public.sellers add column if not exists updated_at timestamptz not null default now();
update public.sellers set city=coalesce(city,location),country=coalesce(country,'South Sudan'),updated_at=now();

alter table public.products add column if not exists country text default 'South Sudan';
alter table public.products add column if not exists region text;
alter table public.products add column if not exists city text;
alter table public.products add column if not exists neighborhood text;
alter table public.products add column if not exists negotiable boolean not null default false;
alter table public.products add column if not exists contact_mode text not null default 'contact';
update public.products set city=coalesce(city,location),country=coalesce(country,'South Sudan');
alter table public.products alter column currency set default 'SSP';

alter table public.product_images add column if not exists image_url text;
update public.product_images set image_url=coalesce(image_url,url);
alter table public.product_images alter column url drop not null;

create or replace function public.sync_product_image_urls()
returns trigger language plpgsql set search_path=public as $$
begin
  new.image_url:=coalesce(new.image_url,new.url);
  new.url:=coalesce(new.url,new.image_url);
  return new;
end;
$$;
drop trigger if exists sync_product_image_urls_trigger on public.product_images;
create trigger sync_product_image_urls_trigger before insert or update on public.product_images
for each row execute function public.sync_product_image_urls();

alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists delivery_address text;
alter table public.orders add column if not exists updated_at timestamptz not null default now();
alter table public.orders alter column currency set default 'SSP';
alter table public.order_items add column if not exists price numeric;
update public.order_items set price=coalesce(price,unit_price);

alter table public.reviews add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.reviews add column if not exists product_id uuid references public.products(id) on delete cascade;
update public.reviews set user_id=coalesce(user_id,reviewer_id);

alter table public.reports add column if not exists description text;
alter table public.reports alter column status set default 'pending';
update public.reports set status='pending' where status='open';

alter table public.notifications add column if not exists type text not null default 'general';
alter table public.notifications add column if not exists message text;
update public.notifications set message=coalesce(message,body);

create or replace function public.increment_product_views(product_uuid uuid)
returns void language sql security definer set search_path=public as $$
  update public.products set views=views+1 where id=product_uuid and status='active';
$$;
grant execute on function public.increment_product_views(uuid) to anon,authenticated;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(buyer_id,seller_id,product_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check(char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Participants read conversations" on public.conversations;
create policy "Participants read conversations" on public.conversations for select to authenticated
using(auth.uid()=buyer_id or exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=auth.uid()));

drop policy if exists "Buyers create conversations" on public.conversations;
create policy "Buyers create conversations" on public.conversations for insert to authenticated
with check(auth.uid()=buyer_id);

drop policy if exists "Participants update conversations" on public.conversations;
create policy "Participants update conversations" on public.conversations for update to authenticated
using(auth.uid()=buyer_id or exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=auth.uid()))
with check(auth.uid()=buyer_id or exists(select 1 from public.sellers s where s.id=seller_id and s.user_id=auth.uid()));

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages" on public.messages for select to authenticated
using(exists(select 1 from public.conversations c left join public.sellers s on s.id=c.seller_id where c.id=conversation_id and (c.buyer_id=auth.uid() or s.user_id=auth.uid())));

drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages" on public.messages for insert to authenticated
with check(auth.uid()=sender_id and exists(select 1 from public.conversations c left join public.sellers s on s.id=c.seller_id where c.id=conversation_id and (c.buyer_id=auth.uid() or s.user_id=auth.uid())));

drop policy if exists "Recipients mark messages read" on public.messages;
create policy "Recipients mark messages read" on public.messages for update to authenticated
using(exists(select 1 from public.conversations c left join public.sellers s on s.id=c.seller_id where c.id=conversation_id and (c.buyer_id=auth.uid() or s.user_id=auth.uid())))
with check(exists(select 1 from public.conversations c left join public.sellers s on s.id=c.seller_id where c.id=conversation_id and (c.buyer_id=auth.uid() or s.user_id=auth.uid())));

drop policy if exists "seller products delete" on public.products;
create policy "seller products delete" on public.products for delete to authenticated
using(exists(select 1 from public.sellers s where s.id=products.seller_id and s.user_id=auth.uid()));

drop policy if exists "public profiles readable" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using(auth.uid()=id);

drop policy if exists "categories readable" on public.categories;
create policy "categories readable" on public.categories for select to anon,authenticated using(active=true);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
declare display_name text;
begin
  display_name:=coalesce(nullif(new.raw_user_meta_data->>'name',''),nullif(new.raw_user_meta_data->>'full_name',''),split_part(new.email,'@',1),'Dukanen User');
  insert into public.profiles(id,full_name,name,email,role,country,status,updated_at)
  values(new.id,display_name,display_name,new.email,'buyer','South Sudan','active',now())
  on conflict(id) do update set full_name=excluded.full_name,name=excluded.name,email=excluded.email,updated_at=now();
  return new;
end;
$$;

update public.categories set name='Home & Furniture',slug='home-furniture' where slug='home-garden';
update public.categories set active=false where slug in ('electronics','phones-tablets');
insert into public.categories(name,slug,description,active)
values
 ('Phones & Electronics','phones-electronics','Phones, accessories and consumer electronics',true),
 ('Computers','computers','Laptops, desktops and computer accessories',true),
 ('Vehicles','vehicles','Cars, motorcycles and vehicle-related listings',true),
 ('Property','property','Homes, rooms, land and commercial property',true),
 ('Fashion','fashion','Clothing, shoes and accessories',true),
 ('Home & Furniture','home-furniture','Furniture, appliances and household items',true),
 ('Jobs','jobs','Local jobs and work opportunities',true),
 ('Services','services','Professional, technical and local services',true),
 ('Agriculture','agriculture','Farm inputs, tools, produce and livestock-related listings',true),
 ('Beauty & Personal Care','beauty-personal-care','Beauty, grooming and personal care items',true),
 ('Sports & Recreation','sports-recreation','Sports, fitness and recreation items',true),
 ('Baby & Kids','baby-kids','Children, baby and family items',true),
 ('Business Equipment','business-equipment','Office, shop and business equipment',true),
 ('Other','other','Other marketplace listings',true)
on conflict(slug) do update set name=excluded.name,description=excluded.description,active=excluded.active;

create index if not exists conversations_buyer_idx on public.conversations(buyer_id,last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations(seller_id,last_message_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id,created_at asc);
