alter table if exists public.products
  add column if not exists line text,
  add column if not exists gender text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'gender'
  ) then
    alter table public.products
      drop constraint if exists products_gender_check;

    alter table public.products
      add constraint products_gender_check
      check (gender is null or gender in ('nam', 'nu', 'unisex'));
  end if;
end $$;
