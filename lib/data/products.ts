import type { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/server";
import { sampleProducts } from "@/lib/data/sample-products";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const INTERNAL_CATALOG_IMAGE_SLUGS = new Set([
  "zip-hoodie-forest-green",
  "hoodie-ash-grey-layer",
  "oversize-hoodie-blackout",
  "hoodie-tudo",
  "boxy-tee-core-white",
  "oversize-tee-sand-logo",
  "graphic-tee-night-ride",
  "layer-shirt-smoke-grey",
  "prime-jersey-navy",
  "relaxed-cargo-olive",
  "utility-jogger-black",
  "washed-denim-loose-blue",
  "nylon-shorts-sand",
  "cargo-shorts-black",
  "low-top-sneaker-ivory-gum",
  "court-sneaker-grey",
  "canvas-crossbody-bag-black",
  "tech-backpack-olive",
  "dad-cap-mono-black",
  "nylon-cap-khaki",
  "beanie-ribbed-charcoal",
]);

function canUseSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function withStableCatalogImages(product: Product): Product {
  if (!product.slug || !INTERNAL_CATALOG_IMAGE_SLUGS.has(product.slug)) {
    return product;
  }

  return {
    ...product,
    image_url: `/api/catalog-image/${product.slug}?view=front&v=2`,
    image_hover_url: `/api/catalog-image/${product.slug}?view=hover&v=2`,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!canUseSupabase()) {
    return sampleProducts.map(withStableCatalogImages);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,description,price,image_url,image_hover_url,category,stock,owner_id,is_active,line,gender,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products", error);
    return sampleProducts.map(withStableCatalogImages);
  }

  return ((data ?? []) as Product[]).map(withStableCatalogImages);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!canUseSupabase()) {
    const product =
      sampleProducts.find((product) => product.id === id || product.slug === id) ??
      null;
    return product ? withStableCatalogImages(product) : null;
  }

  const supabase = createClient();
  const baseQuery = supabase
    .from("products")
    .select(
      "id,name,slug,description,price,image_url,image_hover_url,category,stock,owner_id,is_active,line,gender,created_at",
    );

  const query = UUID_REGEX.test(id) ? baseQuery.eq("id", id) : baseQuery.eq("slug", id);
  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Failed to fetch product", error);
    const product =
      sampleProducts.find((product) => product.id === id || product.slug === id) ??
      null;
    return product ? withStableCatalogImages(product) : null;
  }

  return data ? withStableCatalogImages(data as Product) : null;
}
