"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type CheckoutPayload = {
  productId: string;
  quantity: number;
  selectedSize?: string;
};

type CustomerPayload = {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  customerNote?: string;
  paymentMethod: "cod" | "bank_transfer";
};

function toCheckoutMessage(errorCode?: string) {
  switch (errorCode) {
    case "EMPTY_CART":
      return "Giỏ hàng đang rỗng.";
    case "INVALID_QUANTITY":
      return "Số lượng sản phẩm không hợp lệ.";
    case "PRODUCT_UNAVAILABLE":
      return "Có sản phẩm không còn bán.";
    case "INSUFFICIENT_STOCK":
      return "Một số sản phẩm không đủ tồn kho. Vui lòng kiểm tra lại giỏ hàng.";
    case "UNAUTHENTICATED":
      return "Vui lòng đăng nhập để đặt hàng.";
    case "MISSING_CUSTOMER_INFO":
      return "Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ nhận hàng.";
    case "INVALID_PAYMENT_METHOD":
      return "Phương thức thanh toán không hợp lệ.";
    default:
      return "Không thể tạo đơn hàng lúc này. Vui lòng thử lại.";
  }
}

function canRetryLegacyPlaceOrder(message: string) {
  return (
    message.includes("Could not find the function") ||
    message.includes("function public.place_order") ||
    message.includes("PGRST202") ||
    message.includes("customer")
  );
}

export async function createOrder(payload: CheckoutPayload[], customer: CustomerPayload) {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Thiếu cấu hình Supabase để tạo đơn hàng." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const normalized = payload
    .map((item) => ({
      product_id: String(item.productId ?? ""),
      quantity: Number(item.quantity ?? 0),
      selected_size: (item.selectedSize ?? "").trim() || null,
    }))
    .filter((item) => item.product_id && item.quantity > 0);

  if (!normalized.length) {
    return { ok: false, message: "Giỏ hàng rỗng." };
  }

  const customerInfo = {
    receiver_name: customer.receiverName.trim(),
    receiver_phone: customer.receiverPhone.trim(),
    shipping_address: customer.shippingAddress.trim(),
    customer_note: customer.customerNote?.trim() || null,
    payment_method: customer.paymentMethod,
  };

  if (
    !customerInfo.receiver_name ||
    !customerInfo.receiver_phone ||
    !customerInfo.shipping_address
  ) {
    return {
      ok: false,
      message: "Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ nhận hàng.",
    };
  }

  let { data, error } = await supabase.rpc("place_order", {
    items: normalized,
    customer: customerInfo,
  });

  if (error && canRetryLegacyPlaceOrder(error.message)) {
    const fallback = await supabase.rpc("place_order", { items: normalized });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    return { ok: false, message: toCheckoutMessage(error.message) };
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return { ok: false, message: "Tạo đơn không thành công." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/");

  const createdOrder = data[0] as {
    order_id: string;
    order_code?: string | null;
    total_amount: number;
  };

  return {
    ok: true,
    message: `Đặt hàng thành công. Mã đơn: ${createdOrder.order_code ?? createdOrder.order_id.slice(0, 8)}`,
    orderId: createdOrder.order_id,
    orderCode: createdOrder.order_code ?? null,
  };
}
