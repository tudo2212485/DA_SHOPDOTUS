"use client";

import { createContext, useContext, type ReactNode } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Product } from "@/types/product";

type CartItem = {
  key: string;
  product: Product;
  size: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, size?: string) => void;
  increaseQuantity: (itemKey: string) => void;
  decreaseQuantity: (itemKey: string) => void;
  removeItem: (itemKey: string) => void;
  clearCart: () => void;
};

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, size = "M") =>
        set((state) => {
          const key = `${product.id}__${size}`;
          const existingItem = state.items.find((item) => item.key === key);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { key, product, size, quantity: 1 }],
          };
        }),
      increaseQuantity: (itemKey) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.key === itemKey
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),
      decreaseQuantity: (itemKey) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.key === itemKey
                ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (itemKey) =>
        set((state) => ({
          items: state.items.filter((item) => item.key !== itemKey),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "dotus-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCartStore();

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
