import { redirect } from "next/navigation";
import { CheckCircle2, LockKeyhole, LogIn, Mail, ShieldCheck, ShoppingBag, UserPlus } from "lucide-react";

import { signIn, signUp } from "@/app/auth/login/actions";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { SetupRequired } from "@/components/layout/setup-required";
import { Button } from "@/components/ui/button";
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
    <main className="relative min-h-[calc(100vh-6.5rem)] overflow-hidden bg-neutral-950 text-neutral-950">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2200&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.82),rgba(10,10,10,0.54),rgba(250,250,250,0.18))]" />

      <section className="relative mx-auto grid min-h-[calc(100vh-6.5rem)] w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_480px] lg:px-8">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur">
            <ShoppingBag className="h-3.5 w-3.5 text-orange-300" />
            DOTUS Member
          </div>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            Đăng nhập để mua sắm nhanh và theo dõi đơn hàng rõ ràng hơn.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/78">
            Tài khoản DOTUS giúp lưu lịch sử mua hàng, kiểm tra trạng thái xử lý và nhận tư vấn phối đồ từ AI Stylist.
          </p>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              "Checkout nhanh",
              "Theo dõi đơn hàng",
              "Quản lý hóa đơn",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/15 bg-white/10 p-4 text-sm font-medium text-white shadow-2xl backdrop-blur"
              >
                <CheckCircle2 className="mb-3 h-5 w-5 text-orange-300" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
                Thành viên DOTUS
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Đăng nhập
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Dùng email đã đăng ký để tiếp tục mua hàng hoặc vào trang quản trị.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          {searchParams?.error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {searchParams.error}
            </p>
          ) : null}
          {searchParams?.message ? (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {searchParams.message}
            </p>
          ) : null}

          <form className="space-y-4">
              <input
                type="hidden"
                name="next"
                value={safePath(searchParams?.next) ?? ""}
              />
              <div className="space-y-1.5">
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  Email
                </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                autoComplete="email"
                required
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-base focus-visible:ring-neutral-900"
              />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                  <LockKeyhole className="h-4 w-4 text-neutral-500" />
                  Mật khẩu
                </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mật khẩu"
                autoComplete="current-password"
                required
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-base focus-visible:ring-neutral-900"
              />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  formAction={signIn}
                  className="h-12 rounded-xl bg-neutral-950 text-base font-semibold text-white hover:bg-neutral-800"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập
                </Button>
                <Button
                  formAction={signUp}
                  variant="outline"
                  className="h-12 rounded-xl border-neutral-200 bg-white text-base font-semibold hover:bg-neutral-50"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tạo tài khoản
                </Button>
              </div>
            </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Hoặc
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <SocialAuthButtons />
          <p className="mt-5 text-center text-xs leading-5 text-neutral-500">
            Nếu là quản trị viên, đăng nhập bằng tài khoản admin để hệ thống tự chuyển vào trang quản lý.
          </p>
        </div>
      </section>
    </main>
  );
}
