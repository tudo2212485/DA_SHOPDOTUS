"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/types/product";

type Toast = {
  id: number;
  productName: string;
  size: string;
};

type FlyItem = {
  id: number;
  imageUrl: string;
  productName: string;
  from: DOMRect;
  to: DOMRect;
};

let toastId = 0;
let notifyAddedToCart: ((product: Product, size: string, source?: HTMLElement | null) => void) | null = null;

function findVisualSource(source?: HTMLElement | null) {
  if (!source) return null;
  return (
    source.closest("[data-cart-fly-source]")?.querySelector("img") ??
    source.closest("[data-cart-fly-source]") ??
    source
  );
}

export function showAddedToCart(product: Product, size = "M", source?: HTMLElement | null) {
  notifyAddedToCart?.(product, size, source);
}

export function useAddToCartFeedback() {
  const { addItem } = useCart();

  return (product: Product, size = "M", source?: HTMLElement | null) => {
    addItem(product, size);
    showAddedToCart(product, size, source);
  };
}

export function CartFeedback() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    notifyAddedToCart = (product, size, source) => {
      const id = ++toastId;
      const visualSource = findVisualSource(source);
      const cartTarget = document.querySelector("[data-cart-target]") as HTMLElement | null;

      setToasts((current) => [{ id, productName: product.name, size }, ...current].slice(0, 3));

      if (visualSource && cartTarget) {
        const from = visualSource.getBoundingClientRect();
        const to = cartTarget.getBoundingClientRect();
        setFlyItems((current) => [
          ...current,
          {
            id,
            imageUrl: product.image_url,
            productName: product.name,
            from,
            to,
          },
        ]);
        timers.current.push(window.setTimeout(() => {
          setFlyItems((current) => current.filter((item) => item.id !== id));
        }, 850));
      }

      timers.current.push(window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 2800));
    };

    return () => {
      notifyAddedToCart = null;
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed right-4 top-24 z-[160] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-cart-toast rounded-lg border border-neutral-200 bg-white/95 p-3 text-neutral-950 shadow-2xl shadow-neutral-950/15 backdrop-blur"
          >
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Đã thêm vào giỏ</p>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {toast.productName} · Size {toast.size}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {flyItems.map((item) => {
        const startX = item.from.left + item.from.width / 2 - 28;
        const startY = item.from.top + item.from.height / 2 - 28;
        const endX = item.to.left + item.to.width / 2 - 28;
        const endY = item.to.top + item.to.height / 2 - 28;

        return (
          <div
            key={item.id}
            className="pointer-events-none fixed z-[170] h-14 w-14 overflow-hidden rounded-lg border border-white bg-white shadow-2xl"
            style={{
              left: startX,
              top: startY,
              "--cart-fly-x": `${endX - startX}px`,
              "--cart-fly-y": `${endY - startY}px`,
            } as React.CSSProperties}
          >
            <div
              className="h-full w-full animate-cart-fly bg-cover bg-center"
              style={{ backgroundImage: `url("${item.imageUrl}")` }}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white opacity-0">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        );
      })}
    </>
  );
}
