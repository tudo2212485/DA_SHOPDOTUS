alter table if exists public.products
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists slug text,
  add column if not exists category text default 'Streetwear',
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists products_slug_unique
  on public.products(slug)
  where slug is not null;

alter table if exists public.orders
  add column if not exists total_amount numeric not null default 0,
  add column if not exists status text not null default 'pending',
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'total_price'
  ) then
    update public.orders
    set total_amount = total_price
    where total_amount = 0;
  end if;
end $$;

alter table if exists public.products enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;

drop policy if exists "products_select_active" on public.products;
drop policy if exists "products_insert_authenticated" on public.products;
drop policy if exists "products_update_owner" on public.products;
drop policy if exists "products_delete_owner" on public.products;

create policy "products_select_active"
  on public.products for select
  using (is_active = true or auth.uid() = owner_id);

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
