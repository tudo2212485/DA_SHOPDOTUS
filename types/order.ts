import type { Product } from "@/types/product";

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  selected_size?: string | null;
  products?: Pick<Product, "id" | "name" | "image_url"> | null;
};

export type Order = {
  id: string;
  order_code?: string | null;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  shipping_address?: string | null;
  customer_note?: string | null;
  payment_method?: "cod" | "bank_transfer" | string | null;
  created_at: string;
  updated_at?: string | null;
  order_items?: OrderItem[];
};
