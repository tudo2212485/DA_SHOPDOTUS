import Link from "next/link";
import { Sparkles, User } from "lucide-react";

import { signOut } from "@/app/auth/login/actions";
import { HeaderActions } from "@/components/layout/header-actions";
import { MainNav } from "@/components/layout/main-nav";
import { isAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  let userEmail: string | null = null;
  let showAdminLink = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
    showAdminLink = await isAdminUser(supabase, user);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="border-b border-orange-200/70 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:border-orange-500/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 text-xs text-neutral-700 dark:text-neutral-200 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 font-medium tracking-[0.04em]">
            <span className="inline-flex items-center gap-1 rounded-full border border-orange-300/70 bg-white/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-orange-600 dark:border-orange-400/40 dark:bg-orange-500/10 dark:text-orange-300">
              <Sparkles className="h-3 w-3" />
              DOTUS
            </span>
            <span>Tối giản để nổi bật. Mặc chất theo cách của bạn.</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-white">
              Tra cứu đơn hàng
            </Link>
            {userEmail ? (
              <div className="flex items-center gap-3">
                {showAdminLink ? (
                  <Link href="/admin" className="font-medium hover:text-neutral-900 dark:hover:text-white">
                    Admin
                  </Link>
                ) : null}
                <span className="hidden text-neutral-500 dark:text-neutral-400 md:inline">
                  {userEmail}
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 font-medium hover:text-neutral-900 dark:hover:text-white"
                  >
                    <User className="h-3.5 w-3.5" />
                    Đăng xuất
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
              >
                <User className="h-3.5 w-3.5" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-bold uppercase tracking-[0.2em] text-neutral-900 dark:text-white">
          DOTUS
        </Link>

        <MainNav />

        <HeaderActions />
      </div>
    </header>
  );
}
