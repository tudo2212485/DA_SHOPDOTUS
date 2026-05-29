"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

function redirectWithOrderMessage(type: "error" | "message", message: string): never {
  redirect(`/admin/orders?${type}=${encodeURIComponent(message)}`);
}

function toOrderActionMessage(message: string) {
  if (message.includes("INVALID_STATUS")) return "Trạng thái đơn hàng không hợp lệ.";
  if (message.includes("NOT_ALLOWED")) return "Bạn không có quyền xử lý đơn hàng này.";
  if (message.includes("ORDER_NOT_FOUND")) return "Không tìm thấy đơn hàng.";
  if (message.includes("INSUFFICIENT_STOCK")) {
    return "Không đủ tồn kho để mở lại đơn hàng này.";
  }
  if (
    message.includes("Could not find") ||
    message.includes("PGRST202") ||
    message.includes("admin_update_order_status")
  ) {
    return "Database chưa chạy migration 009_admin_order_rpc.sql nên chưa thể xử lý đơn hàng.";
  }
  return message;
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const statusValues = formData.getAll("status");
  const status = String(statusValues.at(-1) ?? "") as OrderStatus;

  if (!orderId || !ORDER_STATUSES.includes(status)) {
    redirectWithOrderMessage("error", "Trạng thái đơn hàng không hợp lệ.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: orderId,
    p_status: status,
  });

  if (error) {
    redirectWithOrderMessage("error", toOrderActionMessage(error.message));
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/");
  redirectWithOrderMessage("message", "Đã cập nhật trạng thái đơn hàng.");
}
