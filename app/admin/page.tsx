import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  EyeOff,
  Gauge,
  PackageCheck,
  Plus,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/order";
import type { Product } from "@/types/product";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,price,stock,is_active,created_at,image_url,category,line,owner_id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("id,quantity,unit_price,orders(id,status,total_amount,created_at),products(id,owner_id)");

  const ownedProducts = (products ?? []) as Product[];
  const activeCount = ownedProducts.filter((product) => product.is_active !== false).length;
  const lowStock = ownedProducts.filter((product) => (product.stock ?? 0) <= 3);
  const hiddenCount = ownedProducts.filter((product) => product.is_active === false).length;
  const inventoryValue = ownedProducts.reduce(
    (total, product) => total + product.price * (product.stock ?? 0),
    0,
  );
  const productIdSet = new Set(ownedProducts.map((product) => product.id));
  const ownedOrderRows = ((orderItems ?? []) as unknown as Array<{
    quantity: number;
    unit_price: number;
    orders: { id: string; status: OrderStatus; total_amount: number; created_at: string } | null;
    products: { id: string; owner_id: string | null } | null;
  }>).filter((row) => row.products?.id && productIdSet.has(row.products.id) && row.orders);
  const orderMap = new Map<string, NonNullable<(typeof ownedOrderRows)[number]["orders"]>>();
  ownedOrderRows.forEach((row) => {
    if (row.orders) orderMap.set(row.orders.id, row.orders);
  });
  const orders = Array.from(orderMap.values());
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const paidOrders = orders.filter((order) => order.status === "paid").length;
  const shippedOrders = orders.filter((order) => order.status === "shipped").length;
  const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
  const processedOrders = orders.filter((order) =>
    ["paid", "shipped"].includes(order.status),
  ).length;
  const revenue = ownedOrderRows.reduce(
    (total, row) => total + row.unit_price * row.quantity,
    0,
  );
  const totalStock = ownedProducts.reduce((total, product) => total + (product.stock ?? 0), 0);
  const averageOrderValue = orders.length > 0 ? Math.round(revenue / orders.length) : 0;
  const fulfillmentRate =
    orders.length > 0 ? Math.round(((paidOrders + shippedOrders) / orders.length) * 100) : 0;
  const activeRate =
    ownedProducts.length > 0 ? Math.round((activeCount / ownedProducts.length) * 100) : 0;
  const urgentActions = [
    pendingOrders > 0
      ? `${pendingOrders} đơn đang chờ xử lý`
      : "",
    lowStock.length > 0
      ? `${lowStock.length} sản phẩm sắp hết hàng`
      : "",
    hiddenCount > 0
      ? `${hiddenCount} sản phẩm đang ẩn`
      : "",
  ].filter(Boolean);
  const stockByLine = Object.entries(
    ownedProducts.reduce<Record<string, number>>((acc, product) => {
      const line = product.line ?? "Khác";
      acc[line] = (acc[line] ?? 0) + (product.stock ?? 0);
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-[#111315] text-white shadow-sm">
          <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                Trung tâm điều hành
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Tổng quan vận hành
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                Theo dõi sức khỏe shop theo thời gian thực: đơn hàng, tồn kho, doanh thu
                tạm tính và các việc cần xử lý trước.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild className="bg-white text-neutral-950 hover:bg-neutral-100">
                  <Link href="/admin/products">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm sản phẩm
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link href="/admin/orders">Xử lý đơn hàng</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Ưu tiên hôm nay</p>
              <div className="mt-3 space-y-2">
                {urgentActions.length > 0 ? (
                  urgentActions.map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-300" />
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                    Không có việc khẩn cấp.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-neutral-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Boxes className="h-4 w-4 text-orange-500" />
                Sản phẩm đang bán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{activeCount}</p>
              <p className="mt-1 text-sm text-neutral-500">
                Tổng {ownedProducts.length} sản phẩm trong kho
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Doanh thu tạm tính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {currencyFormatter.format(revenue)}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                AOV {currencyFormatter.format(averageOrderValue)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Sắp hết hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{lowStock.length}</p>
              <p className="mt-1 text-sm text-neutral-500">
                Sản phẩm tồn kho từ 3 trở xuống
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock3 className="h-4 w-4 text-sky-500" />
                Đơn cần xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{pendingOrders}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {processedOrders} đơn đã xử lý
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-neutral-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="h-5 w-5 text-neutral-700" />
              Pipeline vận hành
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Chờ xử lý", value: pendingOrders, tone: "bg-amber-500" },
              { label: "Đã thanh toán", value: paidOrders, tone: "bg-emerald-500" },
              { label: "Đang giao", value: shippedOrders, tone: "bg-sky-500" },
              { label: "Đã hủy", value: cancelledOrders, tone: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-neutral-200 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-neutral-500">{item.value} đơn</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-neutral-100">
                  <div
                    className={`h-2 rounded-full ${item.tone}`}
                    style={{
                      width: `${Math.max(orders.length ? Math.round((item.value / orders.length) * 100) : 0, item.value > 0 ? 10 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-neutral-200 bg-white">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Sản phẩm cần chú ý</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/products">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm sản phẩm
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {ownedProducts.length === 0 ? (
                <div className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                  Chưa có sản phẩm nào. Hãy tạo sản phẩm đầu tiên.
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {[...lowStock, ...ownedProducts.filter((product) => !lowStock.includes(product))]
                    .slice(0, 7)
                    .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">{product.name}</p>
                          {(product.stock ?? 0) <= 3 ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Sắp hết
                            </span>
                          ) : null}
                          {product.is_active === false ? (
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                              Đang ẩn
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-neutral-500">
                          {product.category ?? "Streetwear"} - Tồn {product.stock ?? 0}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {currencyFormatter.format(product.price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <WalletCards className="h-5 w-5 text-emerald-500" />
                  Sức khỏe tồn kho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-md border border-neutral-200 p-3">
                    <p className="text-neutral-500">Tổng tồn</p>
                    <p className="mt-1 text-xl font-semibold">{totalStock}</p>
                  </div>
                  <div className="rounded-md border border-neutral-200 p-3">
                    <p className="text-neutral-500">Giá trị kho</p>
                    <p className="mt-1 text-sm font-semibold">
                      {currencyFormatter.format(inventoryValue)}
                    </p>
                  </div>
                  <div className="rounded-md border border-neutral-200 p-3">
                    <p className="text-neutral-500">Đang ẩn</p>
                    <p className="mt-1 text-xl font-semibold">{hiddenCount}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-neutral-50 p-3">
                    <p className="text-neutral-500">Tỷ lệ hiển thị</p>
                    <p className="mt-1 text-lg font-semibold">{activeRate}%</p>
                  </div>
                  <div className="rounded-md bg-neutral-50 p-3">
                    <p className="text-neutral-500">Tỷ lệ xử lý đơn</p>
                    <p className="mt-1 text-lg font-semibold">{fulfillmentRate}%</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {stockByLine.length === 0 ? (
                    <p className="text-sm text-neutral-500">Chưa có dữ liệu tồn kho.</p>
                  ) : (
                    stockByLine.map(([line, stock]) => (
                      <div key={line} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{line}</span>
                          <span className="text-neutral-500">{stock} sp</span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-100">
                          <div
                            className="h-2 rounded-full bg-neutral-900"
                            style={{
                              width: `${Math.max(8, Math.round((stock / Math.max(totalStock, 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PackageCheck className="h-5 w-5 text-orange-500" />
                  Quy trình quản trị
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { href: "/admin/orders?status=pending", icon: Clock3, label: "Kiểm tra đơn chờ xử lý", value: `${pendingOrders} đơn` },
                  { href: "/admin/products", icon: AlertTriangle, label: "Bổ sung tồn kho sắp hết", value: `${lowStock.length} sản phẩm` },
                  { href: "/admin/products", icon: EyeOff, label: "Xem sản phẩm đang ẩn", value: `${hiddenCount} sản phẩm` },
                  { href: "/", icon: CheckCircle2, label: "Kiểm tra hiển thị storefront", value: "Mở shop" },
                ].map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 p-3 transition hover:border-orange-300 hover:bg-orange-50"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100">
                        <item.icon className="h-4 w-4 text-neutral-700" />
                      </span>
                      <span className="truncate font-medium text-neutral-900">{item.label}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-2 text-sm text-neutral-500">
                      {item.value}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
