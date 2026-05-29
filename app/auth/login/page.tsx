import { redirect } from "next/navigation";

import { signIn, signUp } from "@/app/auth/login/actions";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { SetupRequired } from "@/components/layout/setup-required";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isAdminUser, safePath } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; message?: string; next?: string };
}) {
  if (!isSupabaseConfigured()) {
    return (
      <SetupRequired
        title="Cần cấu hình Supabase để đăng nhập"
        description="Trang đăng nhập cần Supabase Auth. Hãy thêm biến môi trường trong .env.local rồi khởi động lại server."
      />
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const next =
      safePath(searchParams?.next) ?? ((await isAdminUser(supabase, user)) ? "/admin" : "/dashboard");
    redirect(next);
  }

  return (
    <main className="min-h-[calc(100vh-6.5rem)] px-4 py-10 text-neutral-900 dark:text-neutral-50">
      <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-orange-100 via-white to-sky-100 p-7 md:block dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-300">
            DOTUS MEMBER
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            Đăng nhập để theo dõi đơn hàng và checkout nhanh hơn.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
            <li>• Lưu lịch sử đơn hàng cá nhân.</li>
            <li>• Theo dõi trạng thái xử lý đơn.</li>
            <li>• Dùng chung tài khoản cho email và Facebook.</li>
          </ul>
        </div>
        <Card className="border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-xl">Đăng nhập</CardTitle>
            {searchParams?.error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {searchParams.error}
              </p>
            ) : null}
            {searchParams?.message ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                {searchParams.message}
              </p>
            ) : null}
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <input
                type="hidden"
                name="next"
                value={safePath(searchParams?.next) ?? ""}
              />
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                autoComplete="email"
                required
              />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mật khẩu"
                autoComplete="current-password"
                required
              />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button formAction={signIn}>Đăng nhập</Button>
                <Button formAction={signUp} variant="outline">
                  Tạo tài khoản
                </Button>
              </div>
            </form>
            <div className="my-5 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
            <SocialAuthButtons />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
