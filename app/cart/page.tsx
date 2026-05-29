import { CartCheckout } from "@/components/cart/cart-checkout";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <section className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Giỏ hàng và đặt hàng</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Kiểm tra sản phẩm, nhập thông tin giao hàng và xác nhận hóa đơn.
          </p>
        </div>
        <CartCheckout />
      </section>
    </main>
  );
}
