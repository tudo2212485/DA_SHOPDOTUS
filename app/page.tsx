import Link from "next/link";
import { Flame, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/lib/data/products";
import { getProductBadge } from "@/lib/storefront";

export default async function HomePage() {
  const products = (await getProducts()).filter(
    (product) => (product.gender ?? "nam") === "nam",
  );
  const bestSellers = [...products].sort((a, b) => b.price - a.price).slice(0, 4);
  const newArrivals = [...products].slice(0, 8);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <HeroCarousel />

          <div className="grid gap-3">
            {[
              { icon: Flame, title: "Bán chạy", sub: "Cập nhật theo tuần" },
              { icon: Truck, title: "Giao nhanh", sub: "2-4 ngày toàn quốc" },
              { icon: ShieldCheck, title: "Đổi size", sub: "Hỗ trợ trong 7 ngày" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <item.icon className="h-5 w-5 text-orange-500" />
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.sub}</p>
              </div>
            ))}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">Danh mục nhanh</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Link
                  href="/products?line=Graphic+Tee"
                  className="rounded-xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 px-3 py-2 font-medium transition hover:border-orange-300 hover:shadow-sm dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800"
                >
                  Áo
                </Link>
                <Link
                  href="/products?line=Cargo+Utility"
                  className="rounded-xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 px-3 py-2 font-medium transition hover:border-orange-300 hover:shadow-sm dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800"
                >
                  Quần
                </Link>
                <Link
                  href="/products?line=Basas+Inspired"
                  className="rounded-xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 px-3 py-2 font-medium transition hover:border-orange-300 hover:shadow-sm dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800"
                >
                  Giày
                </Link>
                <Link
                  href="/products?line=Daily+Accessories"
                  className="rounded-xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 px-3 py-2 font-medium transition hover:border-orange-300 hover:shadow-sm dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800"
                >
                  Phụ kiện
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-4 pb-14 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Bán chạy tuần này</h2>
            <Link href="/products?sort=price_desc" className="text-sm text-neutral-600 dark:text-neutral-300">
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product, index) => (
              <ProductCard key={product.id} product={product} badge="Bán chạy" priority={index < 2} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Mới về</h2>
            <Link href="/products?sort=newest" className="text-sm text-neutral-600 dark:text-neutral-300">
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={getProductBadge(product, index, newArrivals.length)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <p className="text-lg font-semibold">Gợi ý nhanh theo nhu cầu</p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Link
              href="/products?line=Graphic+Tee&max=400000"
              className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium transition hover:border-orange-300 hover:bg-orange-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Đi học: Áo dưới 400k
            </Link>
            <Link
              href="/products?line=Cargo+Utility&sort=price_desc"
              className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium transition hover:border-orange-300 hover:bg-orange-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Đi chơi: Quần cargo nổi bật
            </Link>
            <Link
              href="/products?line=Basas+Inspired"
              className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium transition hover:border-orange-300 hover:bg-orange-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Đi làm: Giày low-top dễ phối
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
