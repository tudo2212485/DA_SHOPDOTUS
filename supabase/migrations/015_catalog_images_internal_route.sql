update public.products
set
  image_url = '/api/catalog-image/' || slug || '?view=front',
  image_hover_url = '/api/catalog-image/' || slug || '?view=hover',
  updated_at = now()
where is_active = true
  and slug in (
    'zip-hoodie-forest-green',
    'hoodie-ash-grey-layer',
    'oversize-hoodie-blackout',
    'hoodie-tudo',
    'boxy-tee-core-white',
    'oversize-tee-sand-logo',
    'graphic-tee-night-ride',
    'layer-shirt-smoke-grey',
    'prime-jersey-navy',
    'relaxed-cargo-olive',
    'utility-jogger-black',
    'washed-denim-loose-blue',
    'nylon-shorts-sand',
    'cargo-shorts-black',
    'low-top-sneaker-ivory-gum',
    'court-sneaker-grey',
    'canvas-crossbody-bag-black',
    'tech-backpack-olive',
    'dad-cap-mono-black',
    'nylon-cap-khaki',
    'beanie-ribbed-charcoal'
  );
