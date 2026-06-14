import { supabase } from "@/lib/supabaseClient";

export type OrderItem = {
  name: string;
  price: number;
  qty: number;
  image: string;
};

export type OrderStatus =
  | "Order Confirmed"
  | "Processing"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered";

export type Order = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  trackingId: string;
};

function toOrder(row: any): Order {
  const items = (row.order_items ?? []).map((item: any) => ({
    name: item.product_name,
    price: item.unit_price,
    qty: item.quantity,
    image: item.image_url || `/images/products/${item.product_slug}.webp`,
  }));
  return {
    id: row.id,
    date: row.created_at ?? "",
    total: row.total,
    status: row.status as OrderStatus,
    trackingId: row.awb_number ?? "",
    items,
  };
}

export async function getOrders(): Promise<Order[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(toOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return toOrder(data);
}

export function generateOrderId(): string {
  return `MRT-${Date.now()}`;
}

export const statusColors: Record<OrderStatus, string> = {
  "Order Confirmed": "#16BF78",
  Processing: "#E8A97E",
  Shipped: "#275EFE",
  "Out for Delivery": "#7699FF",
  Delivered: "#16BF78",
};

export const statusFlow: OrderStatus[] = [
  "Order Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];
