update public.products
set is_active = false,
    updated_at = now()
where name ilike 'QA Hoodie%'
   or slug ilike 'qa-hoodie-%'
   or name ilike 'Smoke Test Hoodie%'
   or slug ilike 'smoke-test-hoodie-%';

with curated(slug, name, description, category, line, gender, image_url, image_hover_url) as (
  values
  (
    'zip-hoodie-forest-green',
    'Zip Hoodie Forest Green',
    'Áo hoodie zip xanh rêu form rộng, hợp phối cargo và sneaker sáng màu.',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    'https://loremflickr.com/900/1200/green,hoodie,streetwear?lock=101',
    'https://loremflickr.com/900/1200/green,hoodie,streetwear?lock=102'
  ),
  (
    'hoodie-ash-grey-layer',
    'Hoodie Ash Grey Layer',
    'Hoodie xám tro form rộng, dễ phối layer khi đi học hoặc đi Đà Lạt.',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    'https://loremflickr.com/900/1200/grey,hoodie,streetwear?lock=103',
    'https://loremflickr.com/900/1200/grey,hoodie,streetwear?lock=104'
  ),
  (
    'oversize-hoodie-blackout',
    'Oversize Hoodie Blackout',
    'Hoodie đen oversize, chất dày vừa, phù hợp outfit tối giản hằng ngày.',
    'Hoodie Oversize',
    'Urbas Inspired',
    'nam',
    'https://loremflickr.com/900/1200/black,hoodie,streetwear?lock=105',
    'https://loremflickr.com/900/1200/black,hoodie,streetwear?lock=106'
  ),
  (
    'hoodie-tudo',
    'Hoodie Tudo',
    'Hoodie local brand form rộng, chất nỉ đứng form, phù hợp phối streetwear.',
    'Hoodie Oversize',
    'Vintas Inspired',
    'nam',
    'https://loremflickr.com/900/1200/oversized,hoodie,streetwear?lock=107',
    'https://loremflickr.com/900/1200/oversized,hoodie,streetwear?lock=108'
  ),
  (
    'boxy-tee-core-white',
    'Boxy Tee Core White',
    'Áo thun trắng boxy, dễ phối với quần denim, cargo hoặc shorts.',
    'T-shirt Boxy',
    'Graphic Tee',
    'nam',
    'https://loremflickr.com/900/1200/white,tshirt,streetwear?lock=201',
    'https://loremflickr.com/900/1200/white,tshirt,streetwear?lock=202'
  ),
  (
    'oversize-tee-sand-logo',
    'Oversize Tee Sand Logo',
    'Áo thun oversize màu cát, hợp phối với denim xanh hoặc quần short nylon.',
    'T-shirt Boxy',
    'Graphic Tee',
    'unisex',
    'https://loremflickr.com/900/1200/beige,tshirt,streetwear?lock=203',
    'https://loremflickr.com/900/1200/beige,tshirt,streetwear?lock=204'
  ),
  (
    'graphic-tee-night-ride',
    'Graphic Tee Night Ride',
    'Áo graphic tee màu đen, hợp outfit đi chơi tối và phối phụ kiện bạc.',
    'T-shirt Boxy',
    'Graphic Tee',
    'nam',
    'https://loremflickr.com/900/1200/graphic,tshirt,streetwear?lock=205',
    'https://loremflickr.com/900/1200/graphic,tshirt,streetwear?lock=206'
  ),
  (
    'layer-shirt-smoke-grey',
    'Layer Shirt Smoke Grey',
    'Áo sơ mi xám xanh mặc ngoài tee, phù hợp outfit smart streetwear.',
    'Shirt',
    'Vintas Inspired',
    'unisex',
    'https://loremflickr.com/900/1200/grey,shirt,streetwear?lock=301',
    'https://loremflickr.com/900/1200/grey,shirt,streetwear?lock=302'
  ),
  (
    'prime-jersey-navy',
    'Prime Jersey Navy',
    'Áo jersey xanh navy, chất thoáng, phù hợp outfit sporty streetwear.',
    'Shirt',
    'Prime Jersey',
    'unisex',
    'https://loremflickr.com/900/1200/navy,jersey,streetwear?lock=303',
    'https://loremflickr.com/900/1200/navy,jersey,streetwear?lock=304'
  ),
  (
    'relaxed-cargo-olive',
    'Relaxed Cargo Olive',
    'Quần cargo olive dáng rộng, nhiều túi, phối tốt với hoodie hoặc tee trắng.',
    'Pants',
    'Cargo Utility',
    'nam',
    'https://loremflickr.com/900/1200/olive,cargo,pants?lock=401',
    'https://loremflickr.com/900/1200/olive,cargo,pants?lock=402'
  ),
  (
    'utility-jogger-black',
    'Utility Jogger Black',
    'Quần jogger đen nhiều túi, gọn hơn cargo nhưng vẫn giữ chất streetwear.',
    'Pants',
    'Cargo Utility',
    'nam',
    'https://loremflickr.com/900/1200/black,jogger,pants?lock=403',
    'https://loremflickr.com/900/1200/black,jogger,pants?lock=404'
  ),
  (
    'washed-denim-loose-blue',
    'Washed Denim Loose Blue',
    'Quần denim xanh wash dáng loose, dễ phối với tee trắng hoặc hoodie xám.',
    'Pants',
    'Cargo Utility',
    'unisex',
    'https://loremflickr.com/900/1200/blue,denim,pants?lock=405',
    'https://loremflickr.com/900/1200/blue,denim,pants?lock=406'
  ),
  (
    'nylon-shorts-sand',
    'Nylon Shorts Sand',
    'Quần short nylon màu cát, nhẹ, hợp đi chơi và phối với sneaker low-top.',
    'Shorts',
    'Cargo Utility',
    'nam',
    'https://loremflickr.com/900/1200/beige,shorts,streetwear?lock=407',
    'https://loremflickr.com/900/1200/beige,shorts,streetwear?lock=408'
  ),
  (
    'cargo-shorts-black',
    'Cargo Shorts Black',
    'Quần shorts cargo đen, nhiều túi, hợp sneaker low-top và tee sáng màu.',
    'Shorts',
    'Cargo Utility',
    'nam',
    'https://loremflickr.com/900/1200/black,cargo,shorts?lock=409',
    'https://loremflickr.com/900/1200/black,cargo,shorts?lock=410'
  ),
  (
    'low-top-sneaker-ivory-gum',
    'Low-top Sneaker Ivory Gum',
    'Sneaker low-top màu ivory, đế gum, dễ phối với denim xanh và quần short.',
    'Sneaker Low-top',
    'Basas Inspired',
    'unisex',
    'https://loremflickr.com/900/1200/white,sneakers,shoes?lock=501',
    'https://loremflickr.com/900/1200/white,sneakers,shoes?lock=502'
  ),
  (
    'court-sneaker-grey',
    'Court Sneaker Grey',
    'Sneaker xám low-top, dễ phối với outfit tối màu hoặc quần denim.',
    'Sneaker Low-top',
    'Basas Inspired',
    'unisex',
    'https://loremflickr.com/900/1200/grey,sneakers,shoes?lock=503',
    'https://loremflickr.com/900/1200/grey,sneakers,shoes?lock=504'
  ),
  (
    'canvas-crossbody-bag-black',
    'Canvas Crossbody Bag Black',
    'Túi đeo chéo canvas màu đen, gọn, hợp đi học và mang vật dụng nhỏ.',
    'Bag',
    'Daily Accessories',
    'unisex',
    'https://loremflickr.com/900/1200/black,crossbody,bag?lock=601',
    'https://loremflickr.com/900/1200/black,crossbody,bag?lock=602'
  ),
  (
    'tech-backpack-olive',
    'Tech Backpack Olive',
    'Balo techwear màu olive, hợp đi học, đi làm và mang laptop nhỏ.',
    'Bag',
    'Daily Accessories',
    'unisex',
    'https://loremflickr.com/900/1200/olive,backpack,bag?lock=603',
    'https://loremflickr.com/900/1200/olive,backpack,bag?lock=604'
  ),
  (
    'dad-cap-mono-black',
    'Dad Cap Mono Black',
    'Mũ dad cap đen tối giản, phù hợp outfit tee, hoodie và quần denim.',
    'Cap',
    'Daily Accessories',
    'unisex',
    'https://loremflickr.com/900/1200/black,baseball,cap?lock=701',
    'https://loremflickr.com/900/1200/black,baseball,cap?lock=702'
  ),
  (
    'nylon-cap-khaki',
    'Nylon Cap Khaki',
    'Mũ nylon màu khaki, nhẹ và dễ phối với tee, hoodie hoặc overshirt.',
    'Cap',
    'Daily Accessories',
    'unisex',
    'https://loremflickr.com/900/1200/khaki,cap,fashion?lock=703',
    'https://loremflickr.com/900/1200/khaki,cap,fashion?lock=704'
  ),
  (
    'beanie-ribbed-charcoal',
    'Beanie Ribbed Charcoal',
    'Mũ len beanie màu charcoal, hợp hoodie, jacket và outfit lạnh.',
    'Cap',
    'Daily Accessories',
    'unisex',
    'https://loremflickr.com/900/1200/beanie,hat,fashion?lock=705',
    'https://loremflickr.com/900/1200/beanie,hat,fashion?lock=706'
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
