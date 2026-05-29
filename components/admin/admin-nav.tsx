"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, PackageCheck, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  chart: BarChart3,
  products: Boxes,
  orders: PackageCheck,
};

type AdminNavItem = {
  href: string;
  label: string;
  description?: string;
  icon: keyof typeof icons;
};

export function AdminNav({ items, compact = false }: { items: AdminNavItem[]; compact?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = icons[item.icon];

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              compact
                ? "flex h-10 items-center justify-center gap-2 rounded-md font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                : "group flex items-center gap-3 rounded-md px-3 py-3 text-neutral-300 transition hover:bg-white/10 hover:text-white",
              isActive &&
                (compact
                  ? "bg-neutral-950 text-white hover:bg-neutral-950 hover:text-white"
                  : "bg-white text-neutral-950 hover:bg-white hover:text-neutral-950"),
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={compact ? "" : "min-w-0"}>
              <span className={compact ? "" : "block text-sm font-semibold"}>
                {item.label}
              </span>
              {!compact && item.description ? (
                <span
                  className={cn(
                    "mt-0.5 block truncate text-xs text-neutral-500",
                    isActive ? "text-neutral-600" : "text-neutral-400 group-hover:text-neutral-300",
                  )}
                >
                  {item.description}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </>
  );
}
