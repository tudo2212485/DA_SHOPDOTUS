"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { getGalleryImages, getSizeOptions } from "@/lib/product-options";
import { inferLine } from "@/lib/product-taxonomy";
import type { ProductBadge } from "@/lib/storefront";
import type { Product } from "@/types/product";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function ProductCard({
  product,
  priority = false,
  badge,
}: {
  product: Product;
  priority?: boolean;
  badge?: ProductBadge | null;
}) {
  const { addItem } = useCart();
  const [openQuickView, setOpenQuickView] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const lineLabel = product.line ?? inferLine(product);
  const gallery = useMemo(() => getGalleryImages(product), [product]);
  const sizeOptions = useMemo(() => getSizeOptions(product), [product]);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.value ?? "M");

  const selectedStock =
    sizeOptions.find((option) => option.value === selectedSize)?.stock ?? product.stock ?? 0;
  return (
    <>
      <Card className="group animate-fade-up overflow-hidden border-neutral-200 bg-white text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50">
        <CardHeader className="p-0">
          <div className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-800">
            {badge ? (
              <span className="absolute left-3 top-3 z-10 rounded-md bg-orange-500 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-black">
                {badge}
              </span>
            ) : null}
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={`object-cover transition duration-500 ${
                product.image_hover_url
                  ? "opacity-100 group-hover:scale-105 group-hover:opacity-0"
                  : "group-hover:scale-105"
              }`}
              priority={priority}
            />
            {product.image_hover_url ? (
              <Image
                src={product.image_hover_url}
                alt={`${product.name} - ảnh người mẫu`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
              />
            ) : null}

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100">
              <Link
                href={`/product/${product.slug ?? product.id}`}
                className="pointer-events-auto rounded-md border border-white/70 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-white"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            {product.category ?? "Streetwear"}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{lineLabel}</p>
          <CardTitle className="text-base font-medium leading-snug">{product.name}</CardTitle>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0">
          <p className="font-semibold text-neutral-900 dark:text-neutral-50">
            {currencyFormatter.format(product.price)}
          </p>
          <button
            type="button"
            onClick={() => addItem(product, selectedSize)}
            className="rounded-md border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-800 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-100"
          >
            Thêm vào giỏ
          </button>
        </CardFooter>
      </Card>

      {openQuickView ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpenQuickView(false)}
        >
          <div
            className="w-full max-w-5xl rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-6 md:grid-cols-[1fr_360px]">
              <div className="space-y-3">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={gallery[activeImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 60vw, 100vw"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {gallery.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-md border ${
                        index === activeImage
                          ? "border-neutral-900 dark:border-white"
                          : "border-neutral-300 dark:border-neutral-700"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  {product.category ?? "Streetwear"}
                </p>
                <h3 className="text-2xl font-semibold">{product.name}</h3>
                <p className="text-xl font-semibold">{currencyFormatter.format(product.price)}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {product.description ?? "Sản phẩm streetwear nam tối giản, dễ phối mỗi ngày."}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">Chọn size</p>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Size {selectedSize}: còn {selectedStock}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedSize(option.value)}
                        className={`rounded-md border px-3 py-1.5 text-sm transition ${
                          option.value === selectedSize
                            ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                            : "border-neutral-300 text-neutral-700 hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-200"
                        }`}
                      >
                        {option.value} ({option.stock})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addItem(product, selectedSize);
                      setOpenQuickView(false);
                    }}
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
                  >
                    Thêm vào giỏ
                  </button>
                  <Link
                    href={`/product/${product.slug ?? product.id}`}
                    className="rounded-md border border-neutral-300 px-4 py-2 text-center text-sm font-medium hover:border-neutral-500 dark:border-neutral-700"
                  >
                    Xem chi tiết
                  </Link>
                </div>

                <button
                  type="button"
                  className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
                  onClick={() => setOpenQuickView(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
