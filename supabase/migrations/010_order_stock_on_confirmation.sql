create or replace function public.place_order(items jsonb, customer jsonb default '{}'::jsonb)
returns table(order_id uuid, order_code text, total_amount integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_order_code text;
  v_total integer := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_price integer;
  v_size text;
  v_receiver_name text := nullif(trim(customer ->> 'receiver_name'), '');
  v_receiver_phone text := nullif(trim(customer ->> 'receiver_phone'), '');
  v_shipping_address text := nullif(trim(customer ->> 'shipping_address'), '');
  v_customer_note text := nullif(trim(customer ->> 'customer_note'), '');
  v_payment_method text := coalesce(nullif(trim(customer ->> 'payment_method'), ''), 'cod');
  v_available_stock integer;
begin
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  if v_receiver_name is null or v_receiver_phone is null or v_shipping_address is null then
    raise exception 'MISSING_CUSTOMER_INFO';
  end if;

  if v_payment_method not in ('cod', 'bank_transfer') then
    raise exception 'INVALID_PAYMENT_METHOD';
  end if;

  insert into public.orders (
    user_id,
    status,
    total_amount,
    receiver_name,
    receiver_phone,
    shipping_address,
    customer_note,
    payment_method
  )
  values (
    v_user_id,
    'pending',
    0,
    v_receiver_name,
    v_receiver_phone,
    v_shipping_address,
    v_customer_note,
    v_payment_method
  )
  returning id into v_order_id;

  v_order_code := 'DT' || upper(substr(replace(v_order_id::text, '-', ''), 1, 10));

  update public.orders
  set order_code = v_order_code,
      updated_at = now()
  where id = v_order_id;

  for v_item in select value from jsonb_array_elements(items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    v_size := nullif(trim(v_item ->> 'selected_size'), '');

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'INVALID_QUANTITY';
    end if;

    select p.price, p.stock
      into v_price, v_available_stock
    from public.products p
    where p.id = v_product_id
      and p.is_active = true;

    if not found then
      raise exception 'PRODUCT_UNAVAILABLE';
    end if;

    if v_available_stock < v_quantity then
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
  set total_amount = v_total,
      updated_at = now()
  where id = v_order_id;

  return query
  select v_order_id, v_order_code, v_total;
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
  v_current_deducted boolean;
  v_next_deducted boolean;
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

  v_current_deducted := v_current_status in ('paid', 'shipped');
  v_next_deducted := p_status in ('paid', 'shipped');

  if not v_current_deducted and v_next_deducted then
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

  if v_current_deducted and not v_next_deducted then
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

  update public.orders
  set status = p_status,
      updated_at = now()
  where id = p_order_id;

  return query select p_order_id, p_status;
end;
$$;

grant execute on function public.place_order(jsonb, jsonb) to authenticated, service_role;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated, service_role;
