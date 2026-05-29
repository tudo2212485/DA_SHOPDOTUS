"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";

import { createOrder } from "@/app/cart/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function CartCheckout() {
  const { items, removeItem, clearCart, increaseQuantity, decreaseQuantity } = useCart();
  const [message, setMessage] = useState("");
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod");
  const [isPending, startTransition] = useTransition();

  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  async function onCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setOrderCode(null);

    const formData = new FormData(event.currentTarget);
    const payload = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      selectedSize: item.size,
    }));
    const customer = {
      receiverName: String(formData.get("receiver_name") ?? ""),
      receiverPhone: String(formData.get("receiver_phone") ?? ""),
      shippingAddress: String(formData.get("shipping_address") ?? ""),
      customerNote: String(formData.get("customer_note") ?? ""),
      paymentMethod: String(formData.get("payment_method") ?? "cod") as "cod" | "bank_transfer",
    };

    const result = await createOrder(payload, customer);
    setMessage(result.message);
    if (result.ok) {
      setOrderCode(result.orderCode ?? null);
      clearCart();
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]" onSubmit={(event) => startTransition(() => void onCheckout(event))}>
      {items.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 lg:col-span-2">
          <p className="font-medium">Giỏ hàng rỗng.</p>
          {orderCode ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
              <p>{message}</p>
              <Button asChild className="mt-3">
                <Link href="/dashboard">Xem đơn hàng và hóa đơn</Link>
              </Button>
            </div>
          ) : (
            <Button asChild className="mt-4">
              <Link href="/products">Tiếp tục mua sắm</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Sản phẩm trong giỏ</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Kiểm tra size, số lượng và tồn kho trước khi đặt hàng.
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={clearCart}>
                  Xóa giỏ
                </Button>
              </div>

              <div className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="grid gap-3 py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto]"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Size {item.size} · Đơn giá {currencyFormatter.format(item.product.price)}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {currencyFormatter.format(item.product.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <Button type="button" variant="outline" onClick={() => decreaseQuantity(item.key)}>
                        -
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button type="button" variant="outline" onClick={() => increaseQuantity(item.key)}>
                        +
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeItem(item.key)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold">Thông tin nhận hàng</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Người nhận</label>
                  <Input name="receiver_name" placeholder="Nguyễn Văn A" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <Input name="receiver_phone" type="tel" placeholder="090..." required />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium">Địa chỉ giao hàng</label>
                  <Input
                    name="shipping_address"
                    placeholder="Số nhà, phường/xã, quận/huyện, tỉnh/thành"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium">Ghi chú cho shop</label>
                  <textarea
                    name="customer_note"
                    rows={3}
                    placeholder="Ví dụ: giao sau 18h, gọi trước khi giao..."
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-950"
                  />
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-28">
            <div>
              <h2 className="text-lg font-semibold">Tóm tắt hóa đơn</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Mã đơn sẽ được tạo sau khi đặt hàng thành công.
              </p>
            </div>

            <div className="space-y-2 border-y border-neutral-200 py-4 text-sm dark:border-neutral-800">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{currencyFormatter.format(total)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Phí vận chuyển</span>
                <span>Shop xác nhận sau</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-semibold">
              <span>Tổng thanh toán</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Phương thức thanh toán</p>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                Thanh toán khi nhận hàng
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                <input
                  type="radio"
                  name="payment_method"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                />
                Chuyển khoản ngân hàng
              </label>
            </div>

            {paymentMethod === "bank_transfer" ? (
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
                <p className="font-semibold">Thông tin chuyển khoản demo</p>
                <p className="mt-1">Ngân hàng: MB Bank</p>
                <p>Số tài khoản: 0123456789</p>
                <p>Chủ tài khoản: DOTUS SHOP</p>
                <p className="mt-1">Nội dung: DOTUS + số điện thoại đặt hàng</p>
                <p className="mt-2 text-xs">
                  Sau khi đặt đơn, admin kiểm tra chuyển khoản và bấm Đã xác nhận để trừ tồn kho.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                Admin sẽ gọi xác nhận đơn. Tồn kho chỉ được trừ khi đơn chuyển sang Đã xác nhận.
              </div>
            )}

            <Button
              type="submit"
              disabled={items.length === 0 || isPending}
              className="w-full"
            >
              {isPending ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
            </Button>

            {message ? (
              <p className={orderCode ? "text-sm text-emerald-600 dark:text-emerald-300" : "text-sm text-red-600 dark:text-red-300"}>
                {message}
              </p>
            ) : null}
          </aside>
        </>
      )}
    </form>
  );
}
