create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text unique,
  description text,
  price integer not null check (price >= 0),
  image_url text not null,
  category text not null,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  total_amount integer not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "products_select_active"
  on public.products for select
  using (is_active = true);

create policy "products_insert_authenticated"
  on public.products for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "products_update_owner"
  on public.products for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "products_delete_owner"
  on public.products for delete
  to authenticated
  using (auth.uid() = owner_id);

create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "orders_update_own_pending"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

create policy "orders_delete_own_pending"
  on public.orders for delete
  to authenticated
  using (auth.uid() = user_id and status = 'pending');

create policy "order_items_select_own_order"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "order_items_insert_own_order"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
      and orders.status = 'pending'
    )
  );

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "product_images_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and owner = auth.uid())
  with check (bucket_id = 'product-images' and owner = auth.uid());

create policy "product_images_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and owner = auth.uid());
