import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/login/actions";
import { SetupRequired } from "@/components/layout/setup-required";
import { PrintInvoiceButton } from "@/components/order/print-invoice-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatOrderCode,
  formatPaymentMethod,
  orderStatusDescriptions,
  orderStatusLabels,
  orderStatusStyles,
} from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types/order";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function isMissingSchemaError(message: string) {
  return (
    message.includes("does not exist") ||
    message.includes("Could not find") ||
    message.includes("PGRST204")
  );
}

export default async function DashboardPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <SetupRequired
        title="Cần cấu hình Supabase để xem đơn hàng"
        description="Trang đơn hàng cần Supabase Auth và Database. Hãy thêm biến môi trường trong .env.local và khởi động lại server."
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

  let needsOrderMigration = false;
  const primaryOrdersResult = await supabase
    .from("orders")
    .select(
      "id,order_code,user_id,status,total_amount,receiver_name,receiver_phone,shipping_address,customer_note,payment_method,created_at,updated_at,order_items(id,order_id,product_id,quantity,unit_price,selected_size,products(id,name,image_url))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  let orders = primaryOrdersResult.data as unknown[] | null;
  let error = primaryOrdersResult.error;

  if (error && isMissingSchemaError(error.message)) {
    needsOrderMigration = true;
    const fallback = await supabase
      .from("orders")
      .select(
        "id,user_id,status,total_amount,created_at,order_items(id,order_id,product_id,quantity,unit_price,selected_size,products(id,name,image_url))",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    orders = fallback.data as unknown[] | null;
    error = fallback.error;
  }

  if (error && isMissingSchemaError(error.message)) {
    needsOrderMigration = true;
    const fallback = await supabase
      .from("orders")
      .select(
        "id,user_id,status,total_amount,created_at,order_items(id,order_id,product_id,quantity,unit_price,products(id,name,image_url))",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    orders = fallback.data as unknown[] | null;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  const typedOrders = ((orders ?? []) as unknown as Order[]).map((order) => ({
    ...order,
    order_items: order.order_items ?? [],
  }));

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm print:shadow-none dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                Tài khoản
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Lịch sử đơn hàng</h1>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
            </div>
            <form action={signOut} className="print:hidden">
              <Button variant="outline">Đăng xuất</Button>
            </form>
          </div>
        </div>

        {needsOrderMigration ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 print:hidden dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            Database chưa chạy migration đơn hàng mới, nên trang đang dùng chế độ tương thích. Hãy chạy `supabase/migrations/008_order_fulfillment_invoice.sql` để bật mã hóa đơn, thông tin giao hàng và thanh toán đầy đủ.
          </div>
        ) : null}

        {typedOrders.length === 0 ? (
          <Card className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-lg">Chưa có đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
              <p>Bạn chưa đặt đơn nào. Hãy thêm sản phẩm vào giỏ để bắt đầu mua sắm.</p>
              <Button asChild>
                <Link href="/products">Tiếp tục mua sắm</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {typedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden border-neutral-200 bg-white print:break-inside-avoid print:shadow-none dark:border-neutral-800 dark:bg-neutral-900">
                <CardHeader className="border-b border-neutral-100 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base font-semibold">
                          Hóa đơn #{formatOrderCode(order)}
                        </CardTitle>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${orderStatusStyles[order.status]}`}>
                          {orderStatusLabels[order.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {orderStatusDescriptions[order.status]}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Ngày đặt: {new Date(order.created_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 text-left lg:items-end lg:text-right">
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                        Tổng thanh toán
                      </p>
                      <p className="text-xl font-semibold">
                        {currencyFormatter.format(order.total_amount)}
                      </p>
                      <div className="print:hidden">
                        <PrintInvoiceButton />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Người nhận</p>
                      <p className="mt-1 font-medium">{order.receiver_name ?? "Chưa cập nhật"}</p>
                      <p className="text-neutral-500 dark:text-neutral-400">{order.receiver_phone ?? "Chưa cập nhật"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Thanh toán</p>
                      <p className="mt-1 font-medium">{formatPaymentMethod(order.payment_method)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Địa chỉ giao hàng</p>
                      <p className="mt-1">{order.shipping_address ?? "Chưa cập nhật"}</p>
                      {order.customer_note ? (
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                          Ghi chú: {order.customer_note}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
                    {(order.order_items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 border-b border-neutral-200 px-3 py-3 last:border-b-0 dark:border-neutral-800"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {item.products?.image_url ? (
                            <Image
                              src={item.products.image_url}
                              alt={item.products.name}
                              width={52}
                              height={52}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.products?.name ?? "Sản phẩm"}</p>
                            <p className="text-neutral-500 dark:text-neutral-400">
                              {item.selected_size ? `Size ${item.selected_size} · ` : ""}
                              {item.quantity} x {currencyFormatter.format(item.unit_price)}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 font-medium">
                          {currencyFormatter.format(item.quantity * item.unit_price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
