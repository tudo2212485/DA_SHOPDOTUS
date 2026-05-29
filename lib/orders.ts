import type { OrderStatus } from "@/types/order";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  paid: "Đã xác nhận",
  shipped: "Đang giao",
  cancelled: "Đã hủy",
};

export const orderStatusDescriptions: Record<OrderStatus, string> = {
  pending: "Shop đã nhận đơn và đang xác nhận thông tin.",
  paid: "Admin đã xác nhận đơn. Tồn kho đã được trừ và đơn chuẩn bị đóng gói.",
  shipped: "Đơn đang được giao đến khách hàng.",
  cancelled: "Đơn đã bị hủy.",
};

export const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  shipped: "bg-sky-50 text-sky-700 border-sky-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function formatOrderCode(order: { id: string; order_code?: string | null }) {
  return order.order_code || `DT${order.id.replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

export function formatPaymentMethod(method?: string | null) {
  if (method === "bank_transfer") return "Chuyển khoản";
  return "Thanh toán khi nhận hàng";
}
