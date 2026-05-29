"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  secondaryHref: string;
};

const slides: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1800&q=80",
    eyebrow: "Summer Drop 2026",
    title: "Mặc đẹp mỗi ngày với streetwear nam tối giản",
    description:
      "Chọn nhanh áo, quần, giày và phụ kiện theo từng nhu cầu đi học, đi làm, đi chơi.",
    primaryHref: "/products",
    secondaryHref: "/products?sort=newest",
  },
  {
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=80",
    eyebrow: "New Arrival",
    title: "Bộ sưu tập áo boxy và hoodie form rộng",
    description: "Tông màu trung tính, dễ phối với quần cargo và giày low-top.",
    primaryHref: "/products?line=Graphic+Tee",
    secondaryHref: "/products?line=Urbas+Inspired",
  },
  {
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=80",
    eyebrow: "Best Seller",
    title: "Set đồ đi chơi cuối tuần bán chạy",
    description: "Gợi ý mix nhanh: tee trắng, cargo olive và sneaker đen.",
    primaryHref: "/products?sort=price_desc",
    secondaryHref: "/products?line=Cargo+Utility",
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  function goNext() {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }

  function goPrev() {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="absolute inset-0">
        <Image
          key={activeSlide.image}
          src={activeSlide.image}
          alt={activeSlide.title}
          fill
          className="animate-fade-up object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/20" />
      </div>
      <div className="relative flex min-h-[420px] flex-col justify-end gap-4 p-6 text-white md:min-h-[520px] md:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-orange-300">
          {activeSlide.eyebrow}
        </p>
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
          {activeSlide.title}
        </h1>
        <p className="max-w-xl text-sm text-neutral-100 sm:text-base">
          {activeSlide.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={activeSlide.primaryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-orange-500/30 transition hover:scale-[1.02]"
          >
            Mua ngay
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={activeSlide.secondaryHref}
            className="rounded-xl border border-white/45 px-5 py-2.5 text-sm text-white transition hover:bg-white/10"
          >
            Xem thêm
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Ảnh trước"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white transition hover:bg-black/50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Ảnh kế tiếp"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white transition hover:bg-black/50"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-6 flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Chọn ảnh ${index + 1}`}
            className={`h-2.5 rounded-full transition ${
              index === activeIndex ? "w-7 bg-orange-400" : "w-2.5 bg-white/55"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
