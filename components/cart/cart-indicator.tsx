"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/contexts/cart-context";

export function CartIndicator() {
  const { items } = useCart();
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href="/cart"
      data-cart-target
      aria-label={`Mở giỏ hàng, hiện có ${totalQuantity} sản phẩm`}
      className="flex h-10 items-center gap-2 rounded-md border border-neutral-800 px-3 text-sm text-neutral-700 transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      <span>{totalQuantity}</span>
    </Link>
  );
}
