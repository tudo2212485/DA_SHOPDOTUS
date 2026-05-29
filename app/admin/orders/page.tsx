import Image from "next/image";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
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

const statusPriority: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  shipped: 2,
  cancelled: 3,
};

const statusGuides: Record<
  OrderStatus,
  {
    label: string;
    hint: string;
    actionLabel: string;
    actionStatus: OrderStatus;
    tone: string;
    panel: string;
  }
> = {
  pending: {
    label: "Cần xác nhận",
    hint: "Kiểm tra thanh toán/COD rồi xác nhận để trừ tồn kho.",
    actionLabel: "Xác nhận đơn",
    actionStatus: "paid",
    tone: "text-amber-700",
    panel: "border-amber-200 bg-amber-50",
  },
  paid: {
    label: "Chờ giao",
    hint: "Tồn kho đã trừ. Chuẩn bị hàng và chuyển sang đang giao.",
    actionLabel: "Bắt đầu giao",
    actionStatus: "shipped",
    tone: "text-emerald-700",
    panel: "border-emerald-200 bg-emerald-50",
  },
  shipped: {
    label: "Đang vận chuyển",
    hint: "Theo dõi giao hàng. Chỉ hủy khi cần hoàn kho.",
    actionLabel: "Giữ trạng thái",
    actionStatus: "shipped",
    tone: "text-sky-700",
    panel: "border-sky-200 bg-sky-50",
  },
  cancelled: {
    label: "Đã đóng",
    hint: "Đơn đã hủy. Nếu mở lại cần kiểm tra tồn kho trước.",
    actionLabel: "Mở lại chờ xử lý",
    actionStatus: "pending",
    tone: "text-red-700",
    panel: "border-red-200 bg-red-50",
  },
};

function getOrderAgeLabel(createdAt: string) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageMinutes = Math.max(0, Math.floor(ageMs / 60000));
  if (ageMinutes < 60) return `${ageMinutes || 1} phút trước`;
  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours} giờ trước`;
  return `${Math.floor(ageHours / 24)} ngày trước`;
}

function getOrderItemsCount(order: AdminOrder) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

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

  const sortedOrders = Object.values(orders).sort((a, b) => {
    const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
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
  const actionableOrders = sortedOrders.filter((order) => order.status === "pending" || order.status === "paid");
  const confirmedRevenue = sortedOrders
    .filter((order) => order.status === "paid" || order.status === "shipped")
    .reduce((total, order) => total + order.total_amount, 0);
  const pendingRevenue = sortedOrders
    .filter((order) => order.status === "pending")
    .reduce((total, order) => total + order.total_amount, 0);
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
    <main className="bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950 text-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
                DOTUS fulfillment
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Trung tâm xử lý đơn hàng
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Ưu tiên xác nhận đơn mới, chuẩn bị đơn đã xác nhận và theo dõi đơn đang giao. Tồn kho chỉ thay đổi khi trạng thái đi vào hoặc rời khỏi nhóm đã xác nhận.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Cần thao tác", value: actionableOrders.length, note: "chờ xác nhận/giao" },
                  { label: "Giá trị chờ", value: currencyFormatter.format(pendingRevenue), note: "chưa trừ tồn kho" },
                  { label: "Đã xác nhận", value: currencyFormatter.format(confirmedRevenue), note: "đã khóa tồn kho" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/50">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs text-white/50">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <p className="font-semibold">Luồng xử lý đã cấu hình</p>
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/72">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-neutral-950">1</span>
                  <p>Khách đặt đơn, hệ thống tạo trạng thái Chờ xử lý và giữ nguyên tồn kho.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-neutral-950">2</span>
                  <p>Admin xác nhận thanh toán/COD, hệ thống trừ tồn kho đúng số lượng.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-400 text-xs font-bold text-neutral-950">3</span>
                  <p>Nếu hủy sau xác nhận, hệ thống hoàn lại tồn kho để tránh thất thoát.</p>
                </div>
              </div>
            </div>
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

        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <form action="/admin/orders" className="flex w-full max-w-xl gap-2">
              <input type="hidden" name="status" value={selectedStatus === "all" ? "" : selectedStatus} />
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  name="q"
                  defaultValue={searchParams?.q ?? ""}
                  placeholder="Tìm mã đơn, tên khách, số điện thoại..."
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-neutral-700"
                />
              </label>
              <Button type="submit" className="h-11 rounded-xl bg-neutral-950 px-5 text-white hover:bg-neutral-800">
                Tìm
              </Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {filterItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    item.active
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
                  }`}
                >
                  {item.label} ({item.count})
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {needsOrderMigration ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Database chưa chạy migration quản lý đơn hàng mới. Hãy chạy `supabase/migrations/009_admin_order_rpc.sql` trong Supabase SQL Editor để bật danh sách đơn hàng và tránh lỗi vòng lặp RLS.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Chờ xử lý", value: pendingCount, icon: Clock3, color: "text-amber-600", href: "/admin/orders?status=pending" },
            { label: "Đã xác nhận", value: paidCount, icon: CheckCircle2, color: "text-emerald-600", href: "/admin/orders?status=paid" },
            { label: "Đang giao", value: shippedCount, icon: Truck, color: "text-sky-600", href: "/admin/orders?status=shipped" },
            { label: "Đã hủy", value: cancelledCount, icon: XCircle, color: "text-red-600", href: "/admin/orders?status=cancelled" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                </div>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </Link>
          ))}
        </div>

        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PackageCheck className="h-5 w-5 text-orange-500" />
                Hàng đợi vận hành
              </CardTitle>
              <p className="text-sm text-neutral-500">Sắp xếp theo việc cần làm trước</p>
            </div>
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
                  className={`rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${statusGuides[item.status].panel}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${statusGuides[item.status].tone}`} />
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
            {visibleOrders.map((order) => {
              const guide = statusGuides[order.status];
              const StatusIcon = statusIcons[order.status];
              const canUseQuickAction = guide.actionStatus !== order.status;

              return (
              <Card
                key={order.id}
                className="overflow-hidden border-neutral-200 bg-white shadow-sm"
              >
                <CardHeader className="border-b border-neutral-100 bg-neutral-50/80">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">Đơn #{formatOrderCode(order)}</CardTitle>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${orderStatusStyles[order.status]}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {orderStatusLabels[order.status]}
                        </span>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${guide.panel} ${guide.tone}`}>
                          {guide.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">
                        {getOrderAgeLabel(order.created_at)} - {new Date(order.created_at).toLocaleString("vi-VN")} - {getOrderItemsCount(order)} sản phẩm
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
                <CardContent className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-3 text-sm md:grid-cols-3">
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-neutral-500">
                          <Phone className="h-3.5 w-3.5" />
                          Người nhận
                        </p>
                        <p className="mt-2 font-medium">{order.receiver_name ?? "Chưa cập nhật"}</p>
                        <p className="text-neutral-500">{order.receiver_phone ?? "Chưa cập nhật"}</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 md:col-span-1">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-neutral-500">
                          <MapPin className="h-3.5 w-3.5" />
                          Địa chỉ giao
                        </p>
                        <p className="mt-2 leading-5">{order.shipping_address ?? "Chưa cập nhật"}</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-neutral-500">
                          <Banknote className="h-3.5 w-3.5" />
                          Thanh toán
                        </p>
                        <p className="mt-2 font-medium">{formatPaymentMethod(order.payment_method)}</p>
                        {order.customer_note ? (
                          <p className="mt-1 text-neutral-500">Ghi chú: {order.customer_note}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
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
                                width={56}
                                height={56}
                                className="h-14 w-14 rounded-lg object-cover"
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
                          <p className="shrink-0 text-sm font-medium">
                            {currencyFormatter.format(item.unit_price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form
                    action={updateOrderStatus}
                    className={`flex flex-col gap-4 rounded-xl border p-4 ${guide.panel}`}
                  >
                    <input type="hidden" name="order_id" value={order.id} />
                    <div>
                      <p className={`text-sm font-semibold ${guide.tone}`}>{guide.label}</p>
                      <p className="mt-1 text-xs leading-5 text-neutral-600">
                        {guide.hint}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                      >
                        {Object.entries(orderStatusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" className="h-11 w-full rounded-xl bg-neutral-950 text-white hover:bg-neutral-800">
                        Lưu trạng thái
                      </Button>
                      {canUseQuickAction ? (
                        <Button
                          type="submit"
                          name="status"
                          value={guide.actionStatus}
                          variant="outline"
                          className="h-11 w-full rounded-xl border-neutral-300 bg-white"
                        >
                          {guide.actionLabel}
                        </Button>
                      ) : null}
                      {order.status === "pending" ? (
                        <Button
                          type="submit"
                          name="status"
                          value="cancelled"
                          variant="outline"
                          className="h-11 w-full rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-50"
                        >
                          Hủy đơn
                        </Button>
                      ) : null}
                    </div>
                  </form>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
