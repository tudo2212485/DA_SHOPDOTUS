alter table if exists public.order_items
  add column if not exists selected_size text;

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

create or replace function public.place_order(items jsonb)
returns table(order_id uuid, total_amount integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_total integer := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_price integer;
  v_size text;
  v_affected integer;
begin
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  insert into public.orders (user_id, status, total_amount)
  values (v_user_id, 'pending', 0)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    v_size := nullif(trim(v_item ->> 'selected_size'), '');

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'INVALID_QUANTITY';
    end if;

    select p.price
      into v_price
    from public.products p
    where p.id = v_product_id
      and p.is_active = true
    for update;

    if not found then
      raise exception 'PRODUCT_UNAVAILABLE';
    end if;

    update public.products
    set stock = stock - v_quantity,
        updated_at = now()
    where id = v_product_id
      and stock >= v_quantity;

    get diagnostics v_affected = row_count;
    if v_affected = 0 then
      raise exception 'INSUFFICIENT_STOCK';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      quantity,
      unit_price,
      selected_size
    )
    values (
      v_order_id,
      v_product_id,
      v_quantity,
      v_price,
      v_size
    );

    v_total := v_total + (v_price * v_quantity);
  end loop;

  update public.orders
  set total_amount = v_total
  where id = v_order_id;

  return query
  select v_order_id, v_total;
exception
  when others then
    if v_order_id is not null then
      delete from public.orders
      where id = v_order_id
        and user_id = v_user_id
        and status = 'pending';
    end if;
    raise;
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to authenticated, service_role;

