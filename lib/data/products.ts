import type { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/server";
import { sampleProducts } from "@/lib/data/sample-products";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function canUseSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getProducts(): Promise<Product[]> {
  if (!canUseSupabase()) {
    return sampleProducts;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,description,price,image_url,image_hover_url,category,stock,owner_id,is_active,line,gender,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products", error);
    return sampleProducts;
  }

  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!canUseSupabase()) {
    return (
      sampleProducts.find((product) => product.id === id || product.slug === id) ??
      null
    );
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
    return (
      sampleProducts.find((product) => product.id === id || product.slug === id) ??
      null
    );
  }

  return data;
}
