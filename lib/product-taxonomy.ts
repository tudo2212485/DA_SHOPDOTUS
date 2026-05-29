import type { Product } from "@/types/product";

export const PRODUCT_LINES = [
  "Basas Inspired",
  "Vintas Inspired",
  "Urbas Inspired",
  "Pattas Inspired",
  "Graphic Tee",
  "Prime Jersey",
  "Cargo Utility",
  "Daily Accessories",
] as const;

export type ProductLine = (typeof PRODUCT_LINES)[number];
export type GenderSegment = "nam" | "unisex";

export function inferLine(product: Product): ProductLine {
  const text = `${product.name} ${product.category ?? ""}`.toLowerCase();
  if (text.includes("basas") || text.includes("low-top")) return "Basas Inspired";
  if (text.includes("vintas")) return "Vintas Inspired";
  if (text.includes("urbas")) return "Urbas Inspired";
  if (text.includes("pattas")) return "Pattas Inspired";
  if (text.includes("graphic") || text.includes("tee")) return "Graphic Tee";
  if (text.includes("jersey")) return "Prime Jersey";
  if (text.includes("cargo") || text.includes("pants") || text.includes("shorts")) {
    return "Cargo Utility";
  }
  return "Daily Accessories";
}

export function inferGender(product: Product): GenderSegment {
  const text = `${product.name} ${product.category ?? ""}`.toLowerCase();
  if (
    text.includes("oversize") ||
    text.includes("cargo") ||
    text.includes("low-top") ||
    text.includes("hoodie")
  ) {
    return "nam";
  }
  return "unisex";
}
