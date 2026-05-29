import Link from "next/link";
import {
  ExternalLink,
  LogOut,
  Store,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/login/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { SetupRequired } from "@/components/layout/setup-required";
import { Button } from "@/components/ui/button";
import { isAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const adminNavItems = [
  {
    href: "/admin",
    label: "Tổng quan",
    description: "Chỉ số vận hành",
    icon: "chart",
  },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    description: "Giá, tồn kho, hình ảnh",
    icon: "products",
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    description: "Xử lý và cập nhật trạng thái",
    icon: "orders",
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <SetupRequired
        title="Cần cấu hình Supabase để vào trang admin"
        description="Trang admin cần Supabase Auth, Database và Storage. Hãy thêm biến môi trường trong .env.local rồi khởi động lại server."
      />
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  if (!(await isAdminUser(supabase, user))) {
    redirect("/dashboard");
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#f4f5f7] text-neutral-950">
      <aside className="hidden h-full w-76 border-r border-neutral-200 bg-[#111315] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500 text-white shadow-lg shadow-orange-950/30">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">DOTUS</p>
            <p className="text-xs text-neutral-400">Vận hành cửa hàng</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          <AdminNav items={adminNavItems} />
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-md bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.email}</p>
              <p className="text-xs text-neutral-400">Quản trị viên</p>
            </div>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="w-full border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex h-full flex-col lg:pl-80">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              DOTUS Admin
            </p>
            <h1 className="text-lg font-semibold tracking-tight">Điều hành cửa hàng</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden h-10 items-center gap-2 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 sm:inline-flex"
            >
              <ExternalLink className="h-4 w-4" />
              Xem cửa hàng
            </Link>
            <form action={signOut}>
              <Button variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </form>
          </div>
        </header>

        <nav className="grid grid-cols-3 border-b border-neutral-200 bg-white px-2 py-2 text-sm lg:hidden">
          <AdminNav items={adminNavItems} compact />
        </nav>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
