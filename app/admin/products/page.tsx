import { redirect } from "next/navigation";

import { SetupRequired } from "@/components/layout/setup-required";
import { ProductAdminForm } from "@/components/product/product-admin-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <SetupRequired
        title="Cần cấu hình Supabase để quản lý sản phẩm"
        description="Trang admin sử dụng Supabase Auth, Storage và Database. Hãy thêm biến môi trường trong .env.local rồi khởi động lại server."
      />
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,description,price,image_url,image_hover_url,category,line,gender,stock,owner_id,is_active,created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quản lý sản phẩm</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Quản lý danh mục, giá, tồn kho, hình ảnh và trạng thái hiển thị trên storefront.
          </p>
        </div>
        <ProductAdminForm products={products ?? []} />
      </section>
    </main>
  );
}
