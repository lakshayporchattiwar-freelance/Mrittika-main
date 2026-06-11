"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { OrderRecord, TrackingStatus } from "@/lib/types";

const STAGES = [
  "Order Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const STATUS_MAP: Record<string, number> = {
  "Order Confirmed": 0,
  "Payment Verified": 0,
  Processing: 1,
  Shipped: 2,
  IN_TRANSIT: 2,
  "Out for Delivery": 3,
  OUT_FOR_DELIVERY: 3,
  Delivered: 4,
  DELIVERED: 4,
};

function getStageIndex(status: string): number {
  return STATUS_MAP[status] ?? 0;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") ?? "";
  const [query, setQuery] = useState(initialId);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [tracking, setTracking] = useState<TrackingStatus | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialFetched, setInitialFetched] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");

  const fetchOrder = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        setOrder(null);
        setTracking(null);
      } else {
        const data: OrderRecord = await res.json();
        setOrder(data);
        if (data.awbNumber) {
          try {
            const trackRes = await fetch(`/api/shipping/track?awb=${data.awbNumber}`);
            if (trackRes.ok) {
              const trackData: TrackingStatus = await trackRes.json();
              setTracking(trackData);
            }
          } catch {
            setTracking(null);
          }
        }
      }
    } catch {
      setOrder(null);
      setTracking(null);
    }
    setSearched(true);
    setLoading(false);
  }, []);

  const handleTrack = useCallback(() => {
    const searchId = query.trim();
    if (!searchId) return;
    fetchOrder(searchId);
  }, [query, fetchOrder]);

  if (initialId && !initialFetched) {
    setInitialFetched(true);
    fetchOrder(initialId);
  }

  const currentStage = order ? getStageIndex(order.status) : -1;

  const copyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb).then(() => {
      setCopyMsg("Copied!");
      setTimeout(() => setCopyMsg(""), 2000);
    });
  };

  return (
    <section className="section py-12">
      <div className="container max-w-2xl">
        <h1 className="font-display text-3xl mb-8">Track Your Order</h1>

        <div className="flex gap-3 mb-10">
          <input
            className="input flex-1"
            type="text"
            placeholder="Enter Order ID (e.g. MRT-1234567890)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
          <button className="btn btn-primary" onClick={handleTrack} disabled={loading}>
            {loading ? "Searching..." : "Track"}
          </button>
        </div>

        {searched && !order && !loading && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)] mb-2">Order not found.</p>
            <p className="text-sm">
              Could not load tracking. Contact us on WhatsApp:{" "}
              <a href="https://wa.me/916000386664" className="text-[#8B4513] underline">
                6000386664
              </a>
            </p>
          </div>
        )}

        {order && (
          <div className="space-y-8">
            <div className="bg-[var(--color-white-warm)] rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">Order ID</span>
                <span className="font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">Date</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">Payment</span>
                <span>{order.paymentMethod}</span>
              </div>
              {order.awbNumber ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--color-text-muted)]">AWB</span>
                  <span className="flex items-center gap-2">
                    <strong>{order.awbNumber}</strong>
                    <button
                      onClick={() => copyAwb(order.awbNumber!)}
                      className="text-xs text-[#8B4513] hover:underline"
                    >
                      {copyMsg || "Copy"}
                    </button>
                  </span>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">
                  Your order is confirmed and will be picked up for delivery shortly. AWB not yet assigned.
                </p>
              )}
            </div>

            <div className="relative pl-8">
              {STAGES.map((stage, index) => {
                const isCompleted = index <= currentStage;
                const isCurrent = index === currentStage;
                const isLast = index === STAGES.length - 1;

                return (
                  <div key={stage} className="relative pb-8 last:pb-0">
                    {!isLast && (
                      <div
                        className={`absolute left-[-24px] top-[28px] w-0.5 h-full ${
                          index < currentStage ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                    <div
                      className={`absolute left-[-32px] top-[6px] w-5 h-5 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500"
                          : "bg-gray-200"
                      } ${isCurrent ? "ring-4 ring-green-500/30 animate-pulse" : ""}`}
                    >
                      {isCompleted && !isCurrent && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span
                        className={`font-medium ${
                          isCompleted ? "text-green-700" : "text-gray-400"
                        }`}
                      >
                        {stage}
                      </span>
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {tracking && tracking.shipmentTrackActivities.length > 0 && (
              <div className="bg-[var(--color-white-warm)] rounded-lg p-6">
                <h3 className="font-display text-lg mb-4">Shipment Activity</h3>
                <div className="space-y-3">
                  {tracking.shipmentTrackActivities.map((a, i) => (
                    <div key={i} className="flex gap-4 text-sm border-b border-gray-100 pb-3 last:border-0">
                      <span className="text-[var(--color-text-muted)] min-w-[100px]">{a.date}</span>
                      <span className="flex-1">{a.activity}</span>
                      <span className="text-[var(--color-text-muted)]">{a.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[var(--color-cream-deep)] rounded-lg p-6">
              <h3 className="font-display text-lg mb-3">Items Ordered</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searched && !loading && (
          <p className="text-center text-[var(--color-text-muted)]">
            Enter your order ID above to see the delivery status.
          </p>
        )}
      </div>
    </section>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="section py-12">
          <div className="container text-center"><p>Loading...</p></div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
