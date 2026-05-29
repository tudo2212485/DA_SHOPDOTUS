drop policy if exists "orders_select_product_owner" on public.orders;
drop policy if exists "orders_update_product_owner" on public.orders;
drop policy if exists "order_items_select_product_owner" on public.order_items;
drop policy if exists "orders_select_admin_or_product_owner" on public.orders;
drop policy if exists "orders_update_admin_or_product_owner" on public.orders;
drop policy if exists "order_items_select_admin_or_product_owner" on public.order_items;

create or replace function public.is_admin_or_order_owner(p_order_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
    or exists (
      select 1
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      where oi.order_id = p_order_id
        and p.owner_id = auth.uid()
    );
$$;

create policy "orders_select_admin_or_product_owner"
  on public.orders for select
  to authenticated
  using (public.is_admin_or_order_owner(id));

create policy "orders_update_admin_or_product_owner"
  on public.orders for update
  to authenticated
  using (public.is_admin_or_order_owner(id))
  with check (public.is_admin_or_order_owner(id));

create policy "order_items_select_admin_or_product_owner"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
    or exists (
      select 1
      from public.products
      where products.id = order_items.product_id
        and products.owner_id = auth.uid()
    )
  );

create or replace function public.admin_order_rows()
returns table (
  order_id uuid,
  order_code text,
  user_id uuid,
  status text,
  total_amount integer,
  receiver_name text,
  receiver_phone text,
  shipping_address text,
  customer_note text,
  payment_method text,
  created_at timestamptz,
  item_id uuid,
  product_id uuid,
  product_name text,
  product_image_url text,
  product_owner_id uuid,
  quantity integer,
  unit_price integer,
  selected_size text
)
language sql
security definer
set search_path = public
as $$
  select
    o.id as order_id,
    o.order_code,
    o.user_id,
    o.status,
    o.total_amount,
    o.receiver_name,
    o.receiver_phone,
    o.shipping_address,
    o.customer_note,
    o.payment_method,
    o.created_at,
    oi.id as item_id,
    p.id as product_id,
    p.name as product_name,
    p.image_url as product_image_url,
    p.owner_id as product_owner_id,
    oi.quantity,
    oi.unit_price,
    oi.selected_size
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.products p on p.id = oi.product_id
  where
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
    or p.owner_id = auth.uid()
  order by o.created_at desc;
$$;

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text
)
returns table(order_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;
  v_is_allowed boolean;
  v_item record;
begin
  if p_status not in ('pending', 'paid', 'shipped', 'cancelled') then
    raise exception 'INVALID_STATUS';
  end if;

  select public.is_admin_or_order_owner(p_order_id) into v_is_allowed;
  if not coalesce(v_is_allowed, false) then
    raise exception 'NOT_ALLOWED';
  end if;

  select orders.status
    into v_current_status
  from public.orders
  where orders.id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_current_status <> 'cancelled' and p_status = 'cancelled' then
    for v_item in
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id
      group by product_id
    loop
      update public.products
      set stock = stock + v_item.quantity,
          updated_at = now()
      where id = v_item.product_id;
    end loop;
  end if;

  if v_current_status = 'cancelled' and p_status <> 'cancelled' then
    for v_item in
      select oi.product_id, sum(oi.quantity)::integer as quantity, p.stock
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      where oi.order_id = p_order_id
      group by oi.product_id, p.stock
    loop
      if v_item.stock < v_item.quantity then
        raise exception 'INSUFFICIENT_STOCK';
      end if;

      update public.products
      set stock = stock - v_item.quantity,
          updated_at = now()
      where id = v_item.product_id;
    end loop;
  end if;

  update public.orders
  set status = p_status,
      updated_at = now()
  where id = p_order_id;

  return query select p_order_id, p_status;
end;
$$;

revoke all on function public.is_admin_or_order_owner(uuid) from public;
revoke all on function public.admin_order_rows() from public;
revoke all on function public.admin_update_order_status(uuid, text) from public;

grant execute on function public.is_admin_or_order_owner(uuid) to authenticated, service_role;
grant execute on function public.admin_order_rows() to authenticated, service_role;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated, service_role;
