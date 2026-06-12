"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, X } from "lucide-react";
import type { OrderRecord } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  "Order Confirmed": "bg-gray-200 text-gray-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery taking too long",
  "Want to change delivery address",
  "Other",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [cancelModal, setCancelModal] = useState<OrderRecord | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let localOrders: OrderRecord[] = [];
    try {
      const stored = localStorage.getItem("mrittika_orders");
      if (stored) localOrders = JSON.parse(stored);
    } catch {
      // ignore
    }

    const merged = new Map<string, OrderRecord>();
    for (const o of localOrders) {
      merged.set(o.id, o);
    }
    setOrders(Array.from(merged.values()));
    setMounted(true);

    fetch("/api/orders/list")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("fetch failed");
      })
      .then((data) => {
        const serverOrders: OrderRecord[] = data.orders ?? [];
        const merged2 = new Map<string, OrderRecord>();
        for (const o of [...localOrders, ...serverOrders]) {
          if (!merged2.has(o.id)) merged2.set(o.id, o);
          else merged2.set(o.id, { ...merged2.get(o.id)!, ...o });
        }
        const sorted = Array.from(merged2.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      })
      .catch(() => {
        // server fetch failed — local orders already shown
      });
  }, []);

  const openCancelModal = (order: OrderRecord) => {
    setCancelModal(order);
    setCancelReason("");
    setCustomReason("");
    setCancelError(null);
  };

  const closeCancelModal = () => {
    setCancelModal(null);
    setCancelError(null);
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    const reason = cancelReason === "Other" ? customReason : cancelReason;
    if (!reason.trim()) {
      setCancelError("Please select or enter a reason.");
      return;
    }

    setCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/orders/${cancelModal.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === cancelModal.id
              ? { ...o, status: "Cancelled", cancellation: data.cancellation, cancelledAt: new Date().toISOString() }
              : o
          )
        );
        const refundMsg =
          cancelModal.paymentMethod === "Prepaid"
            ? ` Refund of ₹${cancelModal.total} will be credited in 5-7 days.`
            : "";
        setToast(`Order cancelled.${refundMsg}`);
        closeCancelModal();
      } else {
        setCancelError(data.error || "Cancellation failed.");
      }
    } catch {
      setCancelError("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!mounted) {
    return (
      <section className="section py-12">
        <div className="container text-center">
          <h1 className="font-display text-3xl mb-4">My Orders</h1>
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
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
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₹{order.total}</span>
                    {(order.status === "Order Confirmed" || order.status === "Processing") && (
                      <button
                        onClick={() => openCancelModal(order)}
                        className="border border-red-400 text-red-500 text-xs px-3 py-1 rounded-lg hover:bg-red-50 transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
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

      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm z-50 animate-pulse">
          {toast}
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={closeCancelModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-xl mb-4">
              Cancel Order #{cancelModal.id}
            </h2>

            <label className="block text-sm font-medium mb-2">
              Reason for cancellation
            </label>
            <select
              className="input w-full mb-3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {cancelReason === "Other" && (
              <textarea
                className="input w-full mb-3"
                rows={3}
                placeholder="Please tell us why..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            {cancelError && (
              <p className="text-red-600 text-sm mb-3">{cancelError}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeCancelModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cancelling ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cancelling...
                  </span>
                ) : (
                  "Yes, Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
