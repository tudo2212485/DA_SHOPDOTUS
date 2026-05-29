import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import { getProductById, getProducts } from "@/lib/data/products";
import { inferLine } from "@/lib/product-taxonomy";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  const products = await getProducts();

  if (!product) {
    notFound();
  }

  const currentLine = product.line ?? inferLine(product);
  const useInternalImage = product.image_url.startsWith("/api/catalog-image/");
  const related = products
    .filter((item) => item.id !== product.id)
    .filter((item) => (item.line ?? inferLine(item)) === currentLine)
    .slice(0, 4);

  return (
    <main className="min-h-screen px-4 py-10">
      <section className="mx-auto grid max-w-7xl gap-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:aspect-[5/6]">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            priority
            unoptimized={useInternalImage}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              {product.category ?? "Streetwear"}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold">
              {currencyFormatter.format(product.price)}
            </p>
          </div>

          <p className="leading-7 text-neutral-700 dark:text-neutral-300">
            {product.description ??
              "Sản phẩm streetwear tối giản, dễ phối đồ hằng ngày."}
          </p>

          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            Tồn kho: {product.stock ?? "Đang cập nhật"}
          </div>

          <AddToCartButton product={product} showSizeSelector />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Gợi ý phối cùng</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{currentLine}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
