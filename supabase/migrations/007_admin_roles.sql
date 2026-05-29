insert into public.profiles (id, role)
select id, 'customer'
from auth.users
on conflict (id) do nothing;

update public.profiles
set role = 'customer',
    updated_at = now()
where id in (
  select id
  from auth.users
  where lower(email) = 'dotu41080@gmail.com'
);

update public.profiles
set role = 'admin',
    updated_at = now()
where id in (
  select id
  from auth.users
  where lower(email) = 'admin@dotus.test'
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    case
      when lower(new.email) = 'admin@dotus.test' then 'admin'
      else 'customer'
    end
  )
  on conflict (id) do update
    set role = excluded.role,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
