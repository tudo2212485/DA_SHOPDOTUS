-- Restore the catalog to real product photos after the temporary generated-image route.
-- Keep this idempotent so production can be repaired without deleting any products.
with curated(slug, name, description, category, line, gender, image_url, image_hover_url) as (
  values
  (
    'zip-hoodie-forest-green',
    'Zip Hoodie Forest Green',
    'Áo hoodie zip xanh rêu form rộng, hợp phối cargo và sneaker sáng màu.',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'oversize-hoodie-blackout',
    'Oversize Hoodie Blackout',
    'Hoodie đen oversize, chất dày vừa, phù hợp outfit tối giản hằng ngày.',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'hoodie-ash-grey-layer',
    'Hoodie Ash Grey Layer',
    'Hoodie xám tro form rộng, dễ phối layer khi đi học hoặc đi Đà Lạt.',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'hoodie-tudo',
    'Hoodie Tudo',
    'Hoodie local brand form rộng, chất nỉ đứng form, phù hợp phối streetwear.',
    'Hoodie Oversize',
    'Vintas Inspired',
    'nam',
    'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lj4zatlbfx0259',
    'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lj4zatlbfx0259'
  ),
  (
    'boxy-tee-core-white',
    'Boxy Tee Core White',
    'Áo thun trắng boxy, dễ phối với quần denim, cargo hoặc shorts.',
    'T-shirt Boxy',
    'Graphic Tee',
    'nam',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'oversize-tee-sand-logo',
    'Oversize Tee Sand Logo',
    'Áo thun oversize màu cát, hợp phối với denim xanh hoặc quần short nylon.',
    'T-shirt Boxy',
    'Graphic Tee',
    'unisex',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'graphic-tee-night-ride',
    'Graphic Tee Night Ride',
    'Áo graphic tee màu đen, hợp outfit đi chơi tối và phối phụ kiện bạc.',
    'T-shirt Boxy',
    'Graphic Tee',
    'nam',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'layer-shirt-smoke-grey',
    'Layer Shirt Smoke Grey',
    'Áo sơ mi xám xanh mặc ngoài tee, phù hợp outfit smart streetwear.',
    'Shirt',
    'Vintas Inspired',
    'unisex',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'prime-jersey-navy',
    'Prime Jersey Navy',
    'Áo jersey xanh navy, chất thoáng, phù hợp outfit sporty streetwear.',
    'Shirt',
    'Prime Jersey',
    'unisex',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'relaxed-cargo-olive',
    'Relaxed Cargo Olive',
    'Quần cargo olive dáng rộng, nhiều túi, phối tốt với hoodie hoặc tee trắng.',
    'Pants',
    'Cargo Utility',
    'nam',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'utility-jogger-black',
    'Utility Jogger Black',
    'Quần jogger đen nhiều túi, gọn hơn cargo nhưng vẫn giữ chất streetwear.',
    'Pants',
    'Cargo Utility',
    'nam',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'washed-denim-loose-blue',
    'Washed Denim Loose Blue',
    'Quần denim xanh wash dáng loose, dễ phối với tee trắng hoặc hoodie xám.',
    'Pants',
    'Cargo Utility',
    'unisex',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'nylon-shorts-sand',
    'Nylon Shorts Sand',
    'Quần short nylon màu cát, nhẹ, hợp đi chơi và phối với sneaker low-top.',
    'Shorts',
    'Cargo Utility',
    'nam',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'cargo-shorts-black',
    'Cargo Shorts Black',
    'Quần shorts cargo đen, nhiều túi, hợp sneaker low-top và tee sáng màu.',
    'Shorts',
    'Cargo Utility',
    'nam',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&h=1200&q=80&sat=-60',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&h=1200&q=80&sat=-60'
  ),
  (
    'low-top-sneaker-ivory-gum',
    'Low-top Sneaker Ivory Gum',
    'Sneaker low-top màu ivory, đế gum, dễ phối với denim xanh và quần short.',
    'Sneaker Low-top',
    'Basas Inspired',
    'unisex',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'court-sneaker-grey',
    'Court Sneaker Grey',
    'Sneaker xám low-top, dễ phối với outfit tối màu hoặc quần denim.',
    'Sneaker Low-top',
    'Basas Inspired',
    'unisex',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'canvas-crossbody-bag-black',
    'Canvas Crossbody Bag Black',
    'Túi đeo chéo canvas màu đen, gọn, hợp đi học và mang vật dụng nhỏ.',
    'Bag',
    'Daily Accessories',
    'unisex',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'tech-backpack-olive',
    'Tech Backpack Olive',
    'Balo techwear màu olive, hợp đi học, đi làm và mang laptop nhỏ.',
    'Bag',
    'Daily Accessories',
    'unisex',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'dad-cap-mono-black',
    'Dad Cap Mono Black',
    'Mũ dad cap đen tối giản, phù hợp outfit tee, hoodie và quần denim.',
    'Cap',
    'Daily Accessories',
    'unisex',
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'nylon-cap-khaki',
    'Nylon Cap Khaki',
    'Mũ nylon màu khaki, nhẹ và dễ phối với tee, hoodie hoặc overshirt.',
    'Cap',
    'Daily Accessories',
    'unisex',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&h=1200&q=80'
  ),
  (
    'beanie-ribbed-charcoal',
    'Beanie Ribbed Charcoal',
    'Mũ len beanie màu charcoal, hợp hoodie, jacket và outfit lạnh.',
    'Cap',
    'Daily Accessories',
    'unisex',
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&h=1200&q=80',
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1200&h=1200&q=80'
  )
)
update public.products
set
  name = curated.name,
  description = curated.description,
  category = curated.category,
  line = curated.line,
  gender = curated.gender,
  image_url = curated.image_url,
  image_hover_url = curated.image_hover_url,
  updated_at = now()
from curated
where products.slug = curated.slug;

update public.products
set
  image_url = case
    when category in ('Hoodie Oversize') then 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&h=1200&q=80'
    when category in ('T-shirt Boxy', 'Shirt') then 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&h=1200&q=80'
    when category in ('Pants', 'Shorts') then 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&h=1200&q=80'
    when category in ('Sneaker Low-top') then 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&h=1200&q=80'
    when category in ('Bag') then 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&h=1200&q=80'
    when category in ('Cap') then 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&h=1200&q=80'
    else image_url
  end,
  image_hover_url = case
    when category in ('Hoodie Oversize') then 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&h=1200&q=80'
    when category in ('T-shirt Boxy', 'Shirt') then 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&h=1200&q=80'
    when category in ('Pants', 'Shorts') then 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&h=1200&q=80'
    when category in ('Sneaker Low-top') then 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&h=1200&q=80'
    when category in ('Bag') then 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&h=1200&q=80'
    when category in ('Cap') then 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&h=1200&q=80'
    else image_hover_url
  end,
  updated_at = now()
where image_url like '/api/catalog-image/%'
  or coalesce(image_hover_url, '') like '/api/catalog-image/%';
