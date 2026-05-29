import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock3, PackageCheck, Search, Truck, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { updateOrderStatus } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatOrderCode,
  formatPaymentMethod,
  orderStatusLabels,
  orderStatusStyles,
} from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/order";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function isMissingSchemaError(message: string) {
  return (
    message.includes("does not exist") ||
    message.includes("Could not find") ||
    message.includes("PGRST204") ||
    message.includes("PGRST202") ||
    message.includes("infinite recursion")
  );
}

const statusIcons: Record<OrderStatus, typeof Clock3> = {
  pending: Clock3,
  paid: CheckCircle2,
  shipped: Truck,
  cancelled: XCircle,
};

type AdminOrderRow = {
  order_id: string;
  order_code?: string | null;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  shipping_address?: string | null;
  customer_note?: string | null;
  payment_method?: string | null;
  created_at: string;
  item_id: string;
  product_id: string;
  product_name: string;
  product_image_url: string;
  product_owner_id: string | null;
  quantity: number;
  unit_price: number;
  selected_size?: string | null;
};

type AdminOrder = {
  id: string;
  order_code?: string | null;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  shipping_address?: string | null;
  customer_note?: string | null;
  payment_method?: string | null;
  created_at: string;
  items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    selected_size?: string | null;
    products: {
      id: string;
      name: string;
      image_url: string;
      owner_id: string | null;
    } | null;
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { status?: string; q?: string; error?: string; message?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const { data, error } = await supabase.rpc("admin_order_rows");
  const needsOrderMigration = Boolean(error && isMissingSchemaError(error.message));

  if (error && !needsOrderMigration) {
    throw new Error(error.message);
  }

  const rows = needsOrderMigration ? [] : ((data ?? []) as unknown as AdminOrderRow[]);

  const orders = rows.reduce<Record<string, AdminOrder>>((acc, row) => {
    acc[row.order_id] ??= {
      id: row.order_id,
      order_code: row.order_code,
      user_id: row.user_id,
      status: row.status,
      total_amount: row.total_amount,
      receiver_name: row.receiver_name,
      receiver_phone: row.receiver_phone,
      shipping_address: row.shipping_address,
      customer_note: row.customer_note,
      payment_method: row.payment_method,
      created_at: row.created_at,
      items: [],
    };
    acc[row.order_id].items.push({
      id: row.item_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
      selected_size: row.selected_size,
      products: {
        id: row.product_id,
        name: row.product_name,
        image_url: row.product_image_url,
        owner_id: row.product_owner_id,
      },
    });
    return acc;
  }, {});

  const sortedOrders = Object.values(orders).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const selectedStatus = Object.keys(orderStatusLabels).includes(searchParams?.status ?? "")
    ? (searchParams?.status as OrderStatus)
    : "all";
  const query = (searchParams?.q ?? "").trim().toLowerCase();
  const visibleOrders =
    (selectedStatus === "all"
      ? sortedOrders
      : sortedOrders.filter((order) => order.status === selectedStatus)
    ).filter((order) => {
      if (!query) return true;
      const haystack = [
        formatOrderCode(order),
        order.receiver_name,
        order.receiver_phone,
        order.shipping_address,
        order.user_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  const pendingCount = sortedOrders.filter((order) => order.status === "pending").length;
  const paidCount = sortedOrders.filter((order) => order.status === "paid").length;
  const shippedCount = sortedOrders.filter((order) => order.status === "shipped").length;
  const cancelledCount = sortedOrders.filter((order) => order.status === "cancelled").length;
  const filterItems = [
    { href: "/admin/orders", label: "Tất cả", count: sortedOrders.length, active: selectedStatus === "all" },
    ...Object.entries(orderStatusLabels).map(([value, label]) => ({
      href: `/admin/orders?status=${value}${query ? `&q=${encodeURIComponent(query)}` : ""}`,
      label,
      count:
        value === "pending"
          ? pendingCount
          : value === "paid"
            ? paidCount
            : value === "shipped"
              ? shippedCount
              : cancelledCount,
      active: selectedStatus === value,
    })),
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Quản lý đơn hàng</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Theo dõi đơn có sản phẩm của shop, lọc theo trạng thái và cập nhật tiến độ xử lý cho khách hàng.
            </p>
          </div>
        </div>

        {searchParams?.error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {searchParams.error}
          </div>
        ) : null}
        {searchParams?.message ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {searchParams.message}
          </div>
        ) : null}

        <Card className="border-neutral-200 bg-white">
          <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
            <form action="/admin/orders" className="flex w-full max-w-xl gap-2">
              <input type="hidden" name="status" value={selectedStatus === "all" ? "" : selectedStatus} />
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  name="q"
                  defaultValue={searchParams?.q ?? ""}
                  placeholder="Tìm mã đơn, tên khách, số điện thoại..."
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-neutral-600"
                />
              </label>
              <Button type="submit">Tìm</Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {filterItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    item.active
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {item.label} ({item.count})
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          <p className="font-semibold text-neutral-900">Luồng xử lý thông minh</p>
          <p className="mt-1">
            Đơn mới luôn ở trạng thái Chờ xử lý và chưa trừ tồn kho. Khi admin xác nhận thanh toán/COD bằng trạng thái Đã xác nhận, hệ thống mới trừ tồn kho. Nếu hủy sau khi đã xác nhận, tồn kho được hoàn lại.
          </p>
        </div>

        {needsOrderMigration ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Database chưa chạy migration quản lý đơn hàng mới. Hãy chạy `supabase/migrations/009_admin_order_rpc.sql` trong Supabase SQL Editor để bật danh sách đơn hàng và tránh lỗi vòng lặp RLS.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Chờ xử lý", value: pendingCount, icon: Clock3, color: "text-amber-600" },
            { label: "Đã thanh toán", value: paidCount, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Đang giao", value: shippedCount, icon: Truck, color: "text-sky-600" },
          ].map((item) => (
            <Card key={item.label} className="border-neutral-200 bg-white">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-neutral-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                </div>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-neutral-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PackageCheck className="h-5 w-5 text-orange-500" />
              Hàng đợi xử lý
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {[
              { status: "pending" as OrderStatus, count: pendingCount, hint: "Cần xác nhận sớm" },
              { status: "paid" as OrderStatus, count: paidCount, hint: "Sẵn sàng đóng gói" },
              { status: "shipped" as OrderStatus, count: shippedCount, hint: "Theo dõi giao hàng" },
              {
                status: "cancelled" as OrderStatus,
                count: cancelledCount,
                hint: "Cần xem lý do",
              },
            ].map((item) => {
              const Icon = statusIcons[item.status];
              return (
                <Link
                  key={item.status}
                  href={`/admin/orders?status=${item.status}`}
                  className="rounded-lg border border-neutral-200 p-4 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-neutral-700" />
                    <span className="text-2xl font-semibold">{item.count}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{orderStatusLabels[item.status]}</p>
                  <p className="mt-1 text-xs text-neutral-500">{item.hint}</p>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {visibleOrders.length === 0 ? (
          <Card className="border-neutral-200 bg-white">
            <CardContent className="p-8 text-center text-sm text-neutral-500">
              Không có đơn hàng trong bộ lọc hiện tại.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {visibleOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden border-neutral-200 bg-white"
              >
                <CardHeader className="border-b border-neutral-100 bg-neutral-50/80">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">Đơn #{formatOrderCode(order)}</CardTitle>
                        {(() => {
                          const StatusIcon = statusIcons[order.status];
                          return (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${orderStatusStyles[order.status]}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {orderStatusLabels[order.status]}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">
                        {new Date(order.created_at).toLocaleString("vi-VN")} - Khách{" "}
                        {order.receiver_name || order.user_id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                        Giá trị đơn
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {currencyFormatter.format(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Người nhận</p>
                      <p className="mt-1 font-medium">{order.receiver_name ?? "Chưa cập nhật"}</p>
                      <p className="text-neutral-500">{order.receiver_phone ?? "Chưa cập nhật"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Địa chỉ</p>
                      <p className="mt-1">{order.shipping_address ?? "Chưa cập nhật"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Thanh toán</p>
                      <p className="mt-1 font-medium">{formatPaymentMethod(order.payment_method)}</p>
                      {order.customer_note ? (
                        <p className="mt-1 text-neutral-500">Ghi chú: {order.customer_note}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {item.products?.image_url ? (
                            <Image
                              src={item.products.image_url}
                              alt={item.products.name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.products?.name ?? "Sản phẩm"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {item.selected_size ? `Size ${item.selected_size} - ` : ""}
                              Số lượng {item.quantity} - Đơn giá{" "}
                              {currencyFormatter.format(item.unit_price)}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm">
                          {currencyFormatter.format(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <form
                    action={updateOrderStatus}
                    className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <input type="hidden" name="order_id" value={order.id} />
                    <div>
                      <p className="text-sm font-medium">Cập nhật xử lý đơn</p>
                      <p className="text-xs text-neutral-500">
                        Chuyển sang Đã xác nhận sẽ trừ tồn kho; hủy đơn đã xác nhận sẽ hoàn tồn kho.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                      >
                        {Object.entries(orderStatusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <Button type="submit">Lưu</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
