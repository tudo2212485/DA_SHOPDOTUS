import type { Product } from "@/types/product";

export type SizeOption = {
  value: string;
  stock: number;
};

function normalize(text?: string | null) {
  return (text ?? "").toLowerCase();
}

export function getSizePreset(product: Product): string[] {
  const category = normalize(product.category);
  const name = normalize(product.name);
  const line = normalize(product.line);
  const isShoe =
    category.includes("sneaker") ||
    category.includes("shoe") ||
    name.includes("low-top") ||
    name.includes("giay") ||
    line.includes("basas") ||
    line.includes("vintas");

  if (isShoe) return ["39", "40", "41", "42", "43"];

  const isBottom =
    category.includes("pants") || category.includes("shorts") || name.includes("cargo");
  if (isBottom) return ["S", "M", "L", "XL"];

  return ["S", "M", "L", "XL", "XXL"];
}

export function getSizeOptions(product: Product): SizeOption[] {
  const sizes = getSizePreset(product);
  const total = Math.max(product.stock ?? 0, 0);
  if (sizes.length === 0) return [];
  if (total === 0) return sizes.map((value) => ({ value, stock: 0 }));

  let remaining = total;
  return sizes.map((value, index) => {
    const slotsLeft = sizes.length - index;
    const base = Math.floor(remaining / slotsLeft);
    const bonus = index % 2 === 0 ? 1 : 0;
    const stock = Math.max(Math.min(remaining, base + bonus), 0);
    remaining -= stock;
    return { value, stock };
  });
}

export function getGalleryImages(product: Product): string[] {
  const category = normalize(product.category);
  const isShoe = category.includes("sneaker");
  const isTop = category.includes("hoodie") || category.includes("shirt");
  const defaults = isShoe
    ? [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      ]
    : isTop
      ? [
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=1200&q=80",
        ]
      : [
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        ];

  return Array.from(
    new Set([product.image_url, product.image_hover_url ?? "", ...defaults].filter(Boolean)),
  );
}

