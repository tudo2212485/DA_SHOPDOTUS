import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-950">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white/80 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60 md:flex md:items-center md:justify-between md:gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              Membership
            </p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Nhận thông báo drop mới và ưu đãi sớm cho khách hàng DOTUS.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900 md:mt-0"
          >
            Đăng ký nhận tin
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold tracking-tight">DOTUS</h3>
            <p className="max-w-md text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              Streetwear nam tối giản, dễ mặc hằng ngày. Chuyên hoodie oversize, áo
              thun, quần cargo và giày low-top.
            </p>
            <div className="flex gap-2">
              <Link
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-neutral-700 dark:text-neutral-200"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-neutral-700 dark:text-neutral-200"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-300 px-4 text-sm text-neutral-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-neutral-700 dark:text-neutral-200"
              >
                TikTok
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Liên kết nhanh
            </p>
            <div className="grid gap-2 text-sm">
              {[
                { href: "/products", label: "Sản phẩm" },
                { href: "/products?sort=newest", label: "Hàng mới" },
                { href: "/cart", label: "Giỏ hàng" },
                { href: "/dashboard", label: "Theo dõi đơn hàng" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex items-center justify-between rounded-lg border border-transparent px-2 py-2 transition hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Liên hệ
            </p>
            <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
              <p className="flex items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900">
                <MapPin className="mt-0.5 h-4 w-4 text-orange-500" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </p>
              <p className="flex items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900">
                <Phone className="mt-0.5 h-4 w-4 text-orange-500" />
                <span>0900 000 000</span>
              </p>
              <p className="flex items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900">
                <Mail className="mt-0.5 h-4 w-4 text-orange-500" />
                <span>dotus.studio@gmail.com</span>
              </p>
              <p className="flex items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900">
                <Clock3 className="mt-0.5 h-4 w-4 text-orange-500" />
                <span>8:00 - 22:00 mỗi ngày</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© 2026 DOTUS. Cảm ơn bạn đã ghé thăm.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-orange-500">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-orange-500">
              Bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

