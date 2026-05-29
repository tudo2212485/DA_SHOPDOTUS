"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { useAddToCartFeedback } from "@/components/cart/cart-feedback";
import { Button } from "@/components/ui/button";
import { getSizeOptions } from "@/lib/product-options";
import type { Product } from "@/types/product";

export function AddToCartButton({
  product,
  showSizeSelector = false,
}: {
  product: Product;
  showSizeSelector?: boolean;
}) {
  const addToCart = useAddToCartFeedback();
  const sizeOptions = useMemo(() => getSizeOptions(product), [product]);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.value ?? "M");

  const selectedStock =
    sizeOptions.find((option) => option.value === selectedSize)?.stock ?? product.stock ?? 0;

  return (
    <div className="space-y-4">
      {showSizeSelector ? (
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
      ) : null}

      <Button
        type="button"
        className="gap-2"
        onClick={(event) => addToCart(product, selectedSize, event.currentTarget)}
        aria-label={`Thêm ${product.name} size ${selectedSize} vào giỏ hàng`}
      >
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        Thêm vào giỏ
      </Button>
    </div>
  );
}
