create extension if not exists pgcrypto;

create type public.user_role as enum ('buyer','seller','admin');
create type public.user_status as enum ('active','suspended');
create type public.product_status as enum ('draft','active','paused','sold','rejected');
create type public.order_status as enum ('pending','confirmed','processing','ready','shipped','delivered','cancelled','completed');
create type public.payment_status as enum ('unpaid','pending','paid','failed','refunded');
create type public.report_status as enum ('pending','investigating','resolved','dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'buyer',
  country text default 'South Sudan',
  region text,
  city text,
  neighborhood text,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  store_name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_image_url text,
  business_category text,
  country text default 'South Sudan',
  region text,
  city text,
  neighborhood text,
  verified boolean not null default false,
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'USD',
  condition text,
  country text default 'South Sudan',
  region text,
  city text,
  neighborhood text,
  status public.product_status not null default 'draft',
  stock integer not null default 1 check (stock >= 0),
  views integer not null default 0,
  contact_mode text not null default 'contact' check (contact_mode in ('contact','order','checkout')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.sellers(id),
  total numeric(12,2) not null check (total >= 0),
  currency text not null default 'USD',
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  delivery_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null check (price >= 0)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid references public.sellers(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  seller_id uuid references public.sellers(id) on delete cascade,
  reason text not null,
  description text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Dukanen User'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

create policy "Public profiles are readable" on public.profiles for select using (status = 'active');
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Seller stores are public" on public.sellers for select using (true);
create policy "Users create own seller store" on public.sellers for insert with check (auth.uid() = user_id);
create policy "Sellers update own store" on public.sellers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Active categories are public" on public.categories for select using (active = true);

create policy "Active products are public" on public.products for select using (status = 'active' or exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid()));
create policy "Sellers create own products" on public.products for insert with check (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid()));
create policy "Sellers update own products" on public.products for update using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid())) with check (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid()));
create policy "Sellers delete own products" on public.products for delete using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid()));

create policy "Product images are public" on public.product_images for select using (true);
create policy "Seller manages product images" on public.product_images for all using (exists (select 1 from public.products p join public.sellers s on s.id = p.seller_id where p.id = product_id and s.user_id = auth.uid())) with check (exists (select 1 from public.products p join public.sellers s on s.id = p.seller_id where p.id = product_id and s.user_id = auth.uid()));

create policy "Users read own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users manage own favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Buyers and sellers read related orders" on public.orders for select using (auth.uid() = buyer_id or exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid()));
create policy "Buyers create own orders" on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Sellers update related orders" on public.orders for update using (exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid()));

create policy "Related order items are readable" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or exists (select 1 from public.sellers s where s.id = o.seller_id and s.user_id = auth.uid()))));
create policy "Buyer creates order items" on public.order_items for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()));

create policy "Reviews are public" on public.reviews for select using (true);
create policy "Users create reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users update own reviews" on public.reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

create policy "Users create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Users read own reports" on public.reports for select using (auth.uid() = reporter_id);

create policy "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index products_status_created_idx on public.products(status, created_at desc);
create index products_category_idx on public.products(category_id);
create index products_city_idx on public.products(city);
create index products_seller_idx on public.products(seller_id);
create index orders_buyer_idx on public.orders(buyer_id, created_at desc);
create index orders_seller_idx on public.orders(seller_id, created_at desc);
