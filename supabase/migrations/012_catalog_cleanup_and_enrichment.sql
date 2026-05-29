delete from public.products
where (name ilike 'Smoke Test Hoodie%' or slug ilike 'smoke-test-hoodie-%')
  and not exists (
    select 1
    from public.order_items
    where order_items.product_id = products.id
  );

update public.products
set
  category = 'Hoodie Oversize',
  line = 'Urbas Inspired',
  gender = 'nam',
  image_hover_url = coalesce(image_hover_url, image_url),
  is_active = false,
  updated_at = now()
where name ilike 'QA Hoodie%';

update public.products
set
  name = 'Hoodie Tudo',
  slug = 'hoodie-tudo',
  category = 'Hoodie Oversize',
  line = 'Vintas Inspired',
  gender = 'nam',
  image_hover_url = image_url,
  updated_at = now()
where slug = 'hoddie-tudo';

with normalized(slug, category, line, gender, image_url, image_hover_url) as (
  values
  (
    'oversize-hoodie-blackout',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'boxy-tee-core-white',
    'T-shirt Boxy',
    'Graphic Tee',
    'nam',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'low-top-sneaker-shadow',
    'Sneaker Low-top',
    'Basas Inspired',
    'nam',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'relaxed-cargo-olive',
    'Pants',
    'Cargo Utility',
    'nam',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'dad-cap-mono-black',
    'Cap',
    'Daily Accessories',
    'unisex',
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'layer-shirt-smoke-grey',
    'Shirt',
    'Vintas Inspired',
    'unisex',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'graphic-tee-night-ride',
    'T-shirt Boxy',
    'Graphic Tee',
    'nam',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'washed-denim-loose-blue',
    'Pants',
    'Cargo Utility',
    'unisex',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'nylon-shorts-sand',
    'Shorts',
    'Cargo Utility',
    'nam',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'canvas-crossbody-bag-black',
    'Bag',
    'Daily Accessories',
    'unisex',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'low-top-sneaker-ivory-gum',
    'Sneaker Low-top',
    'Basas Inspired',
    'unisex',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'beanie-ribbed-charcoal',
    'Cap',
    'Daily Accessories',
    'unisex',
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'zip-hoodie-forest-green',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1200&q=80'
  )
)
update public.products
set
  category = normalized.category,
  line = normalized.line,
  gender = normalized.gender,
  image_url = normalized.image_url,
  image_hover_url = normalized.image_hover_url,
  updated_at = now()
from normalized
where products.slug = normalized.slug;

with admin as (
  select id
  from auth.users
  where lower(email) = 'admin@dotus.test'
  limit 1
),
item(name, slug, description, price, image_url, image_hover_url, category, line, gender, stock) as (
  values
  (
    'Hoodie Ash Grey Layer',
    'hoodie-ash-grey-layer',
    'Hoodie xám tro form rộng, dễ phối layer khi đi học hoặc đi Đà Lạt.',
    680000,
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    14
  ),
  (
    'Oversize Tee Sand Logo',
    'oversize-tee-sand-logo',
    'Áo thun oversize màu cát, hợp phối với denim xanh hoặc quần short nylon.',
    340000,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    'T-shirt Boxy',
    'Graphic Tee',
    'unisex',
    26
  ),
  (
    'Prime Jersey Navy',
    'prime-jersey-navy',
    'Áo jersey xanh navy, chất thoáng, phù hợp outfit sporty streetwear.',
    450000,
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
    'Shirt',
    'Prime Jersey',
    'unisex',
    18
  ),
  (
    'Utility Jogger Black',
    'utility-jogger-black',
    'Quần jogger đen nhiều túi, gọn hơn cargo nhưng vẫn giữ chất streetwear.',
    560000,
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80',
    'Pants',
    'Cargo Utility',
    'nam',
    15
  ),
  (
    'Cargo Shorts Black',
    'cargo-shorts-black',
    'Quần shorts cargo đen, nhiều túi, hợp sneaker low-top và tee sáng màu.',
    410000,
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=80',
    'Shorts',
    'Cargo Utility',
    'nam',
    20
  ),
  (
    'Court Sneaker Grey',
    'court-sneaker-grey',
    'Sneaker xám low-top, dễ phối với outfit tối màu hoặc quần denim.',
    870000,
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    'Sneaker Low-top',
    'Basas Inspired',
    'unisex',
    11
  ),
  (
    'Nylon Cap Khaki',
    'nylon-cap-khaki',
    'Mũ nylon màu khaki, nhẹ và dễ phối với tee, hoodie hoặc overshirt.',
    270000,
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80',
    'Cap',
    'Daily Accessories',
    'unisex',
    19
  ),
  (
    'Tech Backpack Olive',
    'tech-backpack-olive',
    'Balo techwear màu olive, hợp đi học, đi làm và mang laptop nhỏ.',
    520000,
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80',
    'Bag',
    'Daily Accessories',
    'unisex',
    13
  )
)
insert into public.products (
  owner_id,
  name,
  slug,
  description,
  price,
  image_url,
  image_hover_url,
  category,
  line,
  gender,
  stock,
  is_active
)
select
  admin.id,
  item.name,
  item.slug,
  item.description,
  item.price,
  item.image_url,
  item.image_hover_url,
  item.category,
  item.line,
  item.gender,
  item.stock,
  true
from item cross join admin
on conflict (slug) do update
set
  owner_id = excluded.owner_id,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  image_hover_url = excluded.image_hover_url,
  category = excluded.category,
  line = excluded.line,
  gender = excluded.gender,
  stock = greatest(public.products.stock, excluded.stock),
  is_active = true,
  updated_at = now();
