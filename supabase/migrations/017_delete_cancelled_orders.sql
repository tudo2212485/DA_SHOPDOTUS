create or replace function public.admin_delete_cancelled_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_is_allowed boolean;
begin
  select public.is_admin_or_order_owner(p_order_id) into v_is_allowed;
  if not coalesce(v_is_allowed, false) then
    raise exception 'NOT_ALLOWED';
  end if;

  select status
    into v_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_status <> 'cancelled' then
    raise exception 'ORDER_NOT_CANCELLED';
  end if;

  delete from public.orders
  where id = p_order_id;
end;
$$;

revoke all on function public.admin_delete_cancelled_order(uuid) from public;
grant execute on function public.admin_delete_cancelled_order(uuid) to authenticated, service_role;

delete from public.orders
where status = 'cancelled';
