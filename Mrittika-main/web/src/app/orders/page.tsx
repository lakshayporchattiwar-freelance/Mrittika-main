"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import type { OrderRecord } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  "Order Confirmed": "bg-gray-200 text-gray-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      let localOrders: OrderRecord[] = [];
      try {
        const stored = localStorage.getItem("mrittika_orders");
        if (stored) localOrders = JSON.parse(stored);
      } catch {
        // ignore
      }

      let serverOrders: OrderRecord[] = [];
      try {
        const res = await fetch("/api/orders/list");
        if (res.ok) {
          const data = await res.json();
          serverOrders = data.orders ?? [];
        }
      } catch {
        // ignore
      }

      const merged = new Map<string, OrderRecord>();
      for (const o of [...localOrders, ...serverOrders]) {
        if (!merged.has(o.id)) {
          merged.set(o.id, o);
        } else {
          const existing = merged.get(o.id)!;
          merged.set(o.id, { ...existing, ...o });
        }
      }

      const sorted = Array.from(merged.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(sorted);
      setLoading(false);
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <section className="section py-12">
        <div className="container text-center">
          <h1 className="font-display text-3xl mb-4">My Orders</h1>
          <p className="text-[var(--color-text-muted)]">Loading orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section py-12">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-[var(--color-text-muted)] mb-6">No orders yet</p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[var(--color-white-warm)] rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-sm text-[var(--color-text-muted)] mb-2">
                  {order.items.map((item) => `${item.name} × ${item.qty}`).join(", ")}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-soft)]">
                  <span className="font-semibold">₹{order.total}</span>
                  <Link
                    href={`/track?id=${order.id}`}
                    className="text-sm text-[#8B4513] hover:underline font-medium"
                  >
                    Track Order →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
