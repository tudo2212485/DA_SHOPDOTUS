import Link from "next/link";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Sparkles, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/lib/data/products";
import { inferLine } from "@/lib/product-taxonomy";
import { getProductBadge } from "@/lib/storefront";

type ProductsPageProps = {
  searchParams?: {
    q?: string;
    line?: string;
    sort?: string;
    category?: string;
    section?: string;
    min?: string;
    max?: string;
    stock?: string;
  };
};

export const dynamic = "force-dynamic";

function withParams(
  current: ProductsPageProps["searchParams"],
  updates: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  if (current?.q) params.set("q", current.q);
  if (current?.line) params.set("line", current.line);
  if (current?.sort) params.set("sort", current.sort);
  if (current?.category) params.set("category", current.category);
  if (current?.section) params.set("section", current.section);
  if (current?.min) params.set("min", current.min);
  if (current?.max) params.set("max", current.max);
  if (current?.stock) params.set("stock", current.stock);
  Object.entries(updates).forEach(([key, value]) => {
    if (!value) params.delete(key);
    else params.set(key, value);
  });
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const SECTION_PRESETS = {
  ao: {
    label: "Áo",
    categories: ["T-shirt Boxy", "Hoodie Oversize", "Shirt"],
  },
  quan: {
    label: "Quần",
    categories: ["Pants", "Shorts"],
  },
  giay: {
    label: "Giày",
    categories: ["Sneaker Low-top"],
  },
  "phu-kien": {
    label: "Phụ kiện",
    categories: ["Cap", "Bag"],
  },
} as const;

type SectionKey = keyof typeof SECTION_PRESETS;

function isSectionKey(value: string): value is SectionKey {
  return value in SECTION_PRESETS;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts();

  const sectionRaw = searchParams?.section ?? "";
  const selectedSection: SectionKey | null = isSectionKey(sectionRaw)
    ? sectionRaw
    : null;
  const keyword = (searchParams?.q ?? "").trim().toLowerCase();
  let selectedLine = searchParams?.line ?? "";
  const selectedSort = searchParams?.sort ?? "newest";
  const selectedCategory = searchParams?.category ?? "";
  const minPrice = Number(searchParams?.min ?? "0");
  const maxPrice = Number(searchParams?.max ?? "0");
  const inStockOnly = searchParams?.stock === "1";

  const allowedCategories: Set<string> | null = selectedSection
    ? new Set<string>(SECTION_PRESETS[selectedSection].categories)
    : null;

  const scopedProducts = products.filter((product) => {
    const category = product.category ?? "Streetwear";
    return !allowedCategories || allowedCategories.has(category);
  });

  const categories = selectedSection
    ? Array.from(new Set(scopedProducts.map((p) => p.category ?? "Streetwear"))).sort()
    : Array.from(new Set(products.map((p) => p.category ?? "Streetwear"))).sort();
  const lineOptions = Array.from(
    new Set(scopedProducts.map((product) => product.line ?? inferLine(product))),
  ).sort((a, b) => a.localeCompare(b, "vi"));
  if (selectedLine && !lineOptions.includes(selectedLine)) {
    selectedLine = "";
  }

  let filtered = scopedProducts.filter((product) => {
    const line = product.line ?? inferLine(product);
    const category = product.category ?? "Streetwear";
    if (selectedLine && line !== selectedLine) return false;
    if (selectedCategory && category !== selectedCategory) return false;
    if (minPrice > 0 && product.price < minPrice) return false;
    if (maxPrice > 0 && product.price > maxPrice) return false;
    if (inStockOnly && (product.stock ?? 0) <= 0) return false;
    if (keyword) {
      const haystack = `${product.name} ${category} ${line}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (selectedSort === "price_asc") return a.price - b.price;
    if (selectedSort === "price_desc") return b.price - a.price;
    if (selectedSort === "name_asc") return a.name.localeCompare(b.name, "vi");
    const aTime = new Date(a.created_at ?? 0).getTime();
    const bTime = new Date(b.created_at ?? 0).getTime();
    return bTime - aTime;
  });

  const activeFilters = [
    selectedLine ? `Dòng: ${selectedLine}` : "",
    selectedCategory ? `Loại: ${selectedCategory}` : "",
    minPrice > 0 ? `Từ ${currencyFormatter.format(minPrice)}` : "",
    maxPrice > 0 ? `Đến ${currencyFormatter.format(maxPrice)}` : "",
    inStockOnly ? "Còn hàng" : "",
    keyword ? `Từ khóa: ${keyword}` : "",
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-24 lg:h-fit">
          <div>
            <h2 className="text-lg font-semibold text-orange-500">Dòng sản phẩm</h2>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                href={withParams(searchParams, { line: undefined })}
                className={`block py-0.5 ${!selectedLine ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"}`}
              >
                Tất cả
              </Link>
              {lineOptions.map((line) => (
                <Link
                  key={line}
                  href={withParams(searchParams, { line })}
                  className={`block py-0.5 ${selectedLine === line ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"}`}
                >
                  {line}
                </Link>
              ))}
            </div>
          </div>

          <form action="/products" className="space-y-4">
            <input type="hidden" name="line" value={selectedLine} />
            <input type="hidden" name="section" value={selectedSection ?? ""} />
            <input type="hidden" name="q" value={searchParams?.q ?? ""} />
            <input type="hidden" name="sort" value={selectedSort} />

            <div className="space-y-2">
              <label className="text-sm text-neutral-600 dark:text-neutral-300">Loại sản phẩm</label>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              >
                <option value="">Tất cả</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">Giá từ</label>
                <input
                  name="min"
                  type="number"
                  min={0}
                  defaultValue={minPrice > 0 ? minPrice : ""}
                  placeholder="0"
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">Giá đến</label>
                <input
                  name="max"
                  type="number"
                  min={0}
                  defaultValue={maxPrice > 0 ? maxPrice : ""}
                  placeholder="0"
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" name="stock" value="1" defaultChecked={inStockOnly} />
              Chỉ hiển thị hàng còn tồn
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                className="h-10 rounded-md bg-neutral-900 px-4 text-sm text-white"
              >
                Áp dụng
              </button>
              <Link
                href="/products"
                className="h-10 rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                Xóa lọc
              </Link>
            </div>
          </form>
        </aside>

        <div className="space-y-5">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {selectedSection ? `Đang xem: ${SECTION_PRESETS[selectedSection].label}` : "Đang xem: Tất cả"}
                </span>
                <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                  {filtered.length} sản phẩm
                </span>
              </div>

              <form action="/products" className="flex w-full max-w-xl gap-2">
                <input type="hidden" name="line" value={selectedLine} />
                <input type="hidden" name="sort" value={selectedSort} />
                <input type="hidden" name="category" value={selectedCategory} />
                <input type="hidden" name="section" value={selectedSection ?? ""} />
                <input type="hidden" name="min" value={minPrice > 0 ? minPrice : ""} />
                <input type="hidden" name="max" value={maxPrice > 0 ? maxPrice : ""} />
                <input type="hidden" name="stock" value={inStockOnly ? "1" : ""} />
                <input
                  name="q"
                  defaultValue={searchParams?.q ?? ""}
                  placeholder="Tìm hoodie, low-top, cargo..."
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-400"
                />
                <button
                  type="submit"
                  className="h-10 rounded-md bg-neutral-900 px-4 text-sm text-white dark:bg-white dark:text-neutral-900"
                >
                  Tìm
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                  <SlidersHorizontal className="h-3 w-3" />
                  Lọc thông minh
                </span>
                <Link
                  href={withParams(searchParams, { sort: "newest" })}
                  className={selectedSort === "newest" ? "rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300" : "rounded-lg border border-neutral-300 px-3 py-2 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"}
                >
                  Mới nhất
                </Link>
                <Link
                  href={withParams(searchParams, { sort: "price_asc" })}
                  className={selectedSort === "price_asc" ? "inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300" : "inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"}
                >
                  <ArrowUpNarrowWide className="h-3.5 w-3.5" />
                  Giá tăng
                </Link>
                <Link
                  href={withParams(searchParams, { sort: "price_desc" })}
                  className={selectedSort === "price_desc" ? "inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300" : "inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"}
                >
                  <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                  Giá giảm
                </Link>
              </div>
            </div>

            {activeFilters.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              Không tìm thấy sản phẩm phù hợp bộ lọc.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                  badge={getProductBadge(product, index, filtered.length)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
