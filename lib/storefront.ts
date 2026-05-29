import type { Product } from "@/types/product";
import { inferLine } from "@/lib/product-taxonomy";

export type ProductBadge = "Mới" | "Bán chạy" | "Sắp hết";

export function getProductBadge(
  product: Product,
  index: number,
  total: number,
): ProductBadge | null {
  if ((product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5) return "Sắp hết";
  if (index < Math.max(1, Math.floor(total * 0.25))) return "Mới";
  if (index < Math.max(2, Math.floor(total * 0.5))) return "Bán chạy";
  return null;
}

export function groupByLine(products: Product[]) {
  return products.reduce<Record<string, Product[]>>((acc, product) => {
    const line = product.line ?? inferLine(product);
    if (!acc[line]) acc[line] = [];
    acc[line].push(product);
    return acc;
  }, {});
}
