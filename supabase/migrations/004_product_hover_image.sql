alter table if exists public.products
  add column if not exists image_hover_url text;
