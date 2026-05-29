alter table if exists public.orders
  add column if not exists order_code text,
  add column if not exists receiver_name text,
  add column if not exists receiver_phone text,
  add column if not exists shipping_address text,
  add column if not exists customer_note text,
  add column if not exists payment_method text not null default 'cod',
  add column if not exists updated_at timestamptz not null default now();

update public.orders
set order_code = 'DT' || upper(substr(replace(id::text, '-', ''), 1, 10))
where order_code is null;

create unique index if not exists orders_order_code_key
  on public.orders(order_code);

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
  v_affected integer;
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

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to authenticated, service_role;
