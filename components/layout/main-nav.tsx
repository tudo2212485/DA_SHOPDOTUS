"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Áo", href: "/products?section=ao" },
  { label: "Quần", href: "/products?section=quan" },
  { label: "Giày", href: "/products?section=giay" },
  { label: "Phụ kiện", href: "/products?section=phu-kien" },
  { label: "New drop", href: "/products?sort=newest" },
];

export function MainNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  return (
    <nav className="hidden items-center justify-center gap-2 text-sm font-medium md:flex">
      {NAV_ITEMS.map((item) => {
        const itemUrl = new URL(item.href, "http://localhost");
        const itemSection = itemUrl.searchParams.get("section");
        const isProductsRoot = pathname === "/products";
        const isActive =
          (itemSection && itemSection === section) ||
          (!itemSection && item.href.includes("sort=newest") && isProductsRoot && !section);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "relative rounded-lg px-3 py-2 text-neutral-600 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white",
              isActive && "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300",
            )}
          >
            {item.label}
            {isActive ? (
              <span className="absolute -bottom-3 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent border-t-orange-500/90" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

