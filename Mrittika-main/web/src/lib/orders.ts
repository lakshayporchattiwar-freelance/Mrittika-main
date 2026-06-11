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

type DbOrder = {
  id: string;
  date: string;
  total: number;
  status: string;
  tracking_id: string;
  created_at: string;
};

type DbOrderItem = {
  id: string;
  order_id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

function toOrder(dbOrder: DbOrder, items: DbOrderItem[]): Order {
  return {
    id: dbOrder.id,
    date: dbOrder.date,
    total: dbOrder.total,
    status: dbOrder.status as OrderStatus,
    trackingId: dbOrder.tracking_id,
    items: items.map((item) => ({
      name: item.name,
      price: item.price,
      qty: item.qty,
      image: item.image,
    })),
  };
}

export async function getOrders(): Promise<Order[]> {
  if (!supabase) return [];
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error || !orders) return [];
  return orders.map((o: DbOrder & { order_items: DbOrderItem[] }) =>
    toOrder(o, o.order_items ?? [])
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  const o = data as DbOrder & { order_items: DbOrderItem[] };
  return toOrder(o, o.order_items ?? []);
}

export async function saveOrder(order: Order): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error: orderError } = await supabase.from("orders").insert({
    id: order.id,
    date: order.date,
    total: order.total,
    status: order.status,
    tracking_id: order.trackingId,
  });
  if (orderError) throw orderError;
  const items = order.items.map((item) => ({
    order_id: order.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
    image: item.image,
  }));
  const { error: itemsError } = await supabase.from("order_items").insert(items);
  if (itemsError) throw itemsError;
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
