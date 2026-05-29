create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

update public.products
set owner_id = (
  select id
  from auth.users
  where lower(email) = 'admin@dotus.test'
  limit 1
)
where owner_id is null
  and exists (
    select 1
    from auth.users
    where lower(email) = 'admin@dotus.test'
  );

drop policy if exists "products_select_active" on public.products;
drop policy if exists "products_insert_authenticated" on public.products;
drop policy if exists "products_update_owner" on public.products;
drop policy if exists "products_delete_owner" on public.products;

create policy "products_select_active"
  on public.products for select
  to public
  using (
    is_active = true
    or auth.uid() = owner_id
    or public.is_admin()
  );

create policy "products_insert_authenticated"
  on public.products for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    or public.is_admin()
  );

create policy "products_update_owner"
  on public.products for update
  to authenticated
  using (
    auth.uid() = owner_id
    or public.is_admin()
  )
  with check (
    auth.uid() = owner_id
    or public.is_admin()
  );

create policy "products_delete_owner"
  on public.products for delete
  to authenticated
  using (
    auth.uid() = owner_id
    or public.is_admin()
  );

drop index if exists public.products_slug_unique;

create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);

create index if not exists products_active_category_idx
  on public.products (is_active, category);

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;
