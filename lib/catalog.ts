export const STREETWEAR_CATEGORIES = [
  "Hoodie Oversize",
  "T-shirt Boxy",
  "Shirt",
  "Pants",
  "Shorts",
  "Sneaker Low-top",
  "Cap",
  "Bag",
] as const;

export type StreetwearCategory = (typeof STREETWEAR_CATEGORIES)[number];

export const CATEGORY_GROUPS = [
  {
    key: "tops",
    label: "Tops",
    categories: ["Hoodie Oversize", "T-shirt Boxy", "Shirt"] as const,
  },
  {
    key: "bottoms",
    label: "Bottoms",
    categories: ["Pants", "Shorts"] as const,
  },
  {
    key: "footwear",
    label: "Footwear",
    categories: ["Sneaker Low-top"] as const,
  },
  {
    key: "accessories",
    label: "Accessories",
    categories: ["Cap", "Bag"] as const,
  },
] as const;

export function normalizeCategory(raw?: string | null): StreetwearCategory {
  const value = (raw ?? "").trim();
  if (
    STREETWEAR_CATEGORIES.includes(value as StreetwearCategory)
  ) {
    return value as StreetwearCategory;
  }
  return "T-shirt Boxy";
}
