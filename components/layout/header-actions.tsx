"use client";

import { MapPin, Moon, Search, Sun, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

import { CartIndicator } from "@/components/cart/cart-indicator";
import { useTheme } from "@/components/theme/theme-provider";

export function HeaderActions() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  function openSearch() {
    setSearchOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keyword = String(formData.get("q") ?? "").trim();

    setSearchOpen(false);
    router.push(keyword ? `/products?q=${encodeURIComponent(keyword)}` : "/products");
  }

  return (
    <div className="relative flex items-center gap-2">
      {searchOpen ? (
        <form
          onSubmit={handleSearchSubmit}
          className="absolute right-0 top-12 z-50 flex w-[min(88vw,360px)] items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          <Search className="ml-2 h-4 w-4 shrink-0 text-neutral-400" />
          <input
            ref={searchInputRef}
            name="q"
            placeholder="Tìm áo, quần, giày..."
            className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            className="h-9 rounded-md bg-neutral-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Tìm
          </button>
          <button
            type="button"
            aria-label="Đóng tìm kiếm"
            onClick={() => setSearchOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : null}

      {locationOpen ? (
        <div className="absolute right-12 top-12 z-50 w-[min(88vw,320px)] rounded-lg border border-neutral-200 bg-white p-4 text-sm shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">DOTUS Store</p>
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
            <button
              type="button"
              aria-label="Đóng vị trí"
              onClick={() => setLocationOpen(false)}
              className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            <a
              href="https://www.google.com/maps/search/?api=1&query=12%20Nguyen%20Trai%20Quan%201%20Ho%20Chi%20Minh"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-neutral-200 px-3 py-2 font-medium text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-orange-500/10"
            >
              Mở Google Maps
            </a>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Giờ mở cửa: 09:00 - 21:30 mỗi ngày
            </p>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Tìm kiếm sản phẩm"
        aria-expanded={searchOpen}
        onClick={openSearch}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
      >
        <Search className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Xem vị trí cửa hàng"
        aria-expanded={locationOpen}
        onClick={() => setLocationOpen((open) => !open)}
        className="hidden h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 sm:inline-flex"
      >
        <MapPin className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Bật tắt nền sáng tối"
        onClick={toggleTheme}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-white"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <CartIndicator />
    </div>
  );
}
