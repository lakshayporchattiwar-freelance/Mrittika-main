// TODO: Replace with Supabase table for production scale
import fs from "fs";
import path from "path";
import type { OrderRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]", "utf-8");
  }
}

function readOrders(): OrderRecord[] {
  ensureDataFile();
  const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
  return JSON.parse(raw) as OrderRecord[];
}

function writeOrders(orders: OrderRecord[]): void {
  ensureDataFile();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  const orders = readOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function getOrderByRazorpayOrderId(
  razorpayOrderId: string
): Promise<OrderRecord | null> {
  const orders = readOrders();
  return orders.find((o) => o.razorpayOrderId === razorpayOrderId) ?? null;
}

export async function getOrderByRazorpayPaymentId(
  razorpayPaymentId: string
): Promise<OrderRecord | null> {
  const orders = readOrders();
  return orders.find((o) => o.razorpayPaymentId === razorpayPaymentId) ?? null;
}

export async function updateOrder(
  id: string,
  updates: Partial<OrderRecord>
): Promise<void> {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return;
  orders[index] = { ...orders[index], ...updates };
  writeOrders(orders);
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  const orders = readOrders();
  return orders.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
