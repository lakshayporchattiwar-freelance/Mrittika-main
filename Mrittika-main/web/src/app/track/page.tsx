"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { XCircle, Search, Copy, Check } from "lucide-react";
import DeliveryTracker from "@/components/DeliveryTracker";
import type { OrderRecord } from "@/lib/orderStore";

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
  "PICKUP PENDING": 0,
  "ORDER PLACED": 0,
  Processing: 1,
  "PICKUP GENERATED": 1,
  "PICKUP SCHEDULED": 1,
  Shipped: 2,
  IN_TRANSIT: 2,
  "IN TRANSIT": 2,
  PICKED_UP: 2,
  "PICKED UP": 2,
  "Out for Delivery": 3,
  OUT_FOR_DELIVERY: 3,
  "OUT FOR DELIVERY": 3,
  Delivered: 4,
  DELIVERED: 4,
};

function getStageIndex(status: string): number {
  return STATUS_MAP[status] ?? 0;
}

function normalizeStatus(raw: string): string {
  const upper = raw.toUpperCase().trim();
  for (const key of Object.keys(STATUS_MAP)) {
    if (key.toUpperCase() === upper) return key;
  }
  return raw;
}

interface ShipmentActivity {
  date: string;
  activity: string;
  location: string;
}

interface TrackingResponse {
  success?: boolean;
  trackingData?: any;
  awb?: string;
  status?: string;
  message?: string;
  error?: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  "Order Confirmed": { bg: "rgba(193, 98, 43, 0.08)", text: "var(--color-primary)" },
  Processing: { bg: "rgba(193, 98, 43, 0.08)", text: "var(--color-primary-dark)" },
  Shipped: { bg: "rgba(59, 130, 246, 0.08)", text: "#2563eb" },
  "Out for Delivery": { bg: "rgba(234, 88, 12, 0.08)", text: "#c2410c" },
  Delivered: { bg: "rgba(90, 122, 80, 0.08)", text: "var(--color-natural-dark)" },
  Cancelled: { bg: "rgba(220, 38, 38, 0.08)", text: "#b91c1c" },
};

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") ?? "";
  const [query, setQuery] = useState(initialId);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [activities, setActivities] = useState<ShipmentActivity[]>([]);
  const [trackingMessage, setTrackingMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async (id: string) => {
    setLoading(true);
    setTrackingMessage(null);
    setActivities([]);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        setOrder(null);
      } else {
        const data: OrderRecord = await res.json();
        setOrder(data);

        if (data.status === "Cancelled") {
          setTrackingMessage(null);
          setActivities([]);
        } else {
          try {
            const trackRes = await fetch(`/api/shipping/track?orderId=${id}`);
            if (trackRes.ok) {
              const trackData: TrackingResponse = await trackRes.json();

              if (trackData.message && !trackData.trackingData) {
                setTrackingMessage(trackData.message);
                setActivities([]);
              } else if (trackData.trackingData) {
                const td = trackData.trackingData;
                const shipStatus = td.current_status || td.current_status_name || td.status || "";
                const normalized = normalizeStatus(shipStatus);

                if (STATUS_MAP[normalized] !== undefined) {
                  setOrder((prev) => prev ? { ...prev, status: normalized } : prev);
                }

                if (trackData.awb && !data.awbNumber) {
                  setOrder((prev) => prev ? { ...prev, awbNumber: trackData.awb } : prev);
                }

                const rawActivities = td.shipment_track_activities || td.activities || [];
                setActivities(
                  rawActivities.map((a: any) => ({
                    date: a.date || a.activity_date || "",
                    activity: a.activity || a.status || "",
                    location: a.location || a.city || "",
                  }))
                );
                setTrackingMessage(null);
              }
            }
          } catch {
            setTrackingMessage(null);
            setActivities([]);
          }
        }
      }
    } catch {
      setOrder(null);
    }
    setSearched(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId, fetchOrder]);

  const handleTrack = useCallback(() => {
    const searchId = query.trim();
    if (!searchId) return;
    fetchOrder(searchId);
  }, [query, fetchOrder]);

  const currentStage = order ? getStageIndex(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";

  const copyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const statusStyle = order ? (STATUS_STYLES[order.status] || STATUS_STYLES["Order Confirmed"]) : STATUS_STYLES["Order Confirmed"];

  return (
    <section className="section">
      <div className="container max-w-2xl" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-text-dark)',
          marginBottom: '2rem',
          letterSpacing: 'var(--tracking-tight)',
        }}>
          Track Your Order
        </h1>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              className="input"
              type="text"
              placeholder="Enter Order ID (e.g. MRT-1234567890)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleTrack}
            disabled={loading}
            style={{ whiteSpace: 'nowrap' }}
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </div>

        {searched && !order && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'var(--color-white-warm)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <Search size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-border-soft)' }} />
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Order not found</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Contact us on WhatsApp:{" "}
              <a href="https://wa.me/916000386664" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                6000386664
              </a>
            </p>
          </div>
        )}

        {order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Order Info Card */}
            <div style={{
              background: 'var(--color-white-warm)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xs)',
              padding: '1.5rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--color-border-soft)',
              }}>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-dark)',
                    marginBottom: '0.25rem',
                  }}>
                    {order.id}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {order.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Payment</span>
                  <span style={{ color: 'var(--color-text-dark)', fontWeight: 500 }}>{order.paymentMethod}</span>
                </div>
                {!isCancelled && order.awbNumber ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>AWB</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: 'var(--color-text-dark)' }}>{order.awbNumber}</strong>
                      <button
                        onClick={() => copyAwb(order.awbNumber!)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-primary)',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </span>
                  </div>
                ) : !isCancelled ? (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic',
                  }}>
                    AWB will be assigned once your order is picked up for delivery.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Delivery Tracker or Cancelled */}
            {isCancelled && order.cancellation ? (
              <div style={{
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                background: 'rgba(220, 38, 38, 0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <XCircle size={24} style={{ color: '#b91c1c' }} />
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-xl)',
                    color: '#b91c1c',
                    margin: 0,
                  }}>
                    Order Cancelled
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
                  <p>
                    <span style={{ color: 'var(--color-text-muted)' }}>Reason:</span>{" "}
                    {order.cancellation.reason}
                  </p>
                  <p>
                    <span style={{ color: 'var(--color-text-muted)' }}>Cancelled on:</span>{" "}
                    {order.cancelledAt
                      ? new Date(order.cancelledAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                  {order.cancellation.status === "Refund Initiated" ||
                  order.cancellation.status === "Refunded" ? (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      background: 'rgba(90, 122, 80, 0.1)',
                      color: 'var(--color-natural-dark)',
                      padding: '0.375rem 0.875rem',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      Refund of ₹{order.cancellation.refundAmount ?? order.total} — {order.cancellation.status}
                    </span>
                  ) : order.cancellation.status === "Pending" ? (
                    <p style={{ marginTop: '0.5rem', color: '#c2410c', fontSize: 'var(--text-sm)' }}>
                      Refund under review — WhatsApp us:{" "}
                      <a href="https://wa.me/916000386664" style={{ textDecoration: 'underline' }}>
                        6000386664
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {trackingMessage && (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem 1rem',
                    fontSize: 'var(--text-sm)',
                    color: '#2563eb',
                  }}>
                    {trackingMessage}
                  </div>
                )}

                {/* Delivery Tracker Card */}
                <div style={{
                  background: 'var(--color-white-warm)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xs)',
                  padding: '1.5rem',
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-dark)',
                    marginBottom: '1.5rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--color-border-soft)',
                  }}>
                    Delivery Status
                  </h3>
                  <DeliveryTracker currentStage={currentStage} showDeliveredMessage />
                </div>
              </>
            )}

            {/* Shipment Activity */}
            {activities.length > 0 && (
              <div style={{
                background: 'var(--color-white-warm)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xs)',
                padding: '1.5rem',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-dark)',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--color-border-soft)',
                }}>
                  Shipment Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {activities.map((a, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: 'var(--text-sm)',
                      padding: '0.625rem 0',
                      borderBottom: i < activities.length - 1 ? '1px solid var(--color-cream-deep)' : 'none',
                    }}>
                      <span style={{ color: 'var(--color-text-muted)', minWidth: '100px', flexShrink: 0 }}>{a.date}</span>
                      <span style={{ flex: 1, color: 'var(--color-text-dark)' }}>{a.activity}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{a.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items Ordered */}
            <div style={{
              background: 'var(--color-cream-deep)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-dark)',
                marginBottom: '1rem',
              }}>
                Items Ordered
              </h3>
              {order.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--text-sm)',
                  padding: '0.375rem 0',
                  color: 'var(--color-text-dark)',
                }}>
                  <span>{item.name} &times; {item.qty}</span>
                  <span style={{ fontWeight: 500 }}>₹{item.price * item.qty}</span>
                </div>
              ))}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: 'var(--color-text-dark)',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border-soft)',
              }}>
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link href="/orders" className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
                View All Orders
              </Link>
            </div>
          </div>
        )}

        {!searched && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
          }}>
            Enter your order ID above to see the delivery status.
          </div>
        )}
      </div>
    </section>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="section">
          <div className="container text-center" style={{ paddingTop: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          </div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
