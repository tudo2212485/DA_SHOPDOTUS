create policy "orders_select_product_owner"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1
      from public.order_items
      join public.products on products.id = order_items.product_id
      where order_items.order_id = orders.id
        and products.owner_id = auth.uid()
    )
  );

create policy "orders_update_product_owner"
  on public.orders for update
  to authenticated
  using (
    exists (
      select 1
      from public.order_items
      join public.products on products.id = order_items.product_id
      where order_items.order_id = orders.id
        and products.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.order_items
      join public.products on products.id = order_items.product_id
      where order_items.order_id = orders.id
        and products.owner_id = auth.uid()
    )
  );

create policy "order_items_select_product_owner"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = order_items.product_id
        and products.owner_id = auth.uid()
    )
  );
