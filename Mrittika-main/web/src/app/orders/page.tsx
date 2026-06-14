"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, X, ChevronRight } from "lucide-react";
import type { OrderRecord } from "@/lib/orderStore";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "Order Confirmed": { bg: "rgba(193, 98, 43, 0.08)", text: "var(--color-primary)", dot: "var(--color-primary)" },
  Processing: { bg: "rgba(193, 98, 43, 0.08)", text: "var(--color-primary-dark)", dot: "var(--color-primary-dark)" },
  Shipped: { bg: "rgba(59, 130, 246, 0.08)", text: "#2563eb", dot: "#2563eb" },
  "Out for Delivery": { bg: "rgba(234, 88, 12, 0.08)", text: "#c2410c", dot: "#c2410c" },
  Delivered: { bg: "rgba(90, 122, 80, 0.08)", text: "var(--color-natural-dark)", dot: "var(--color-natural-dark)" },
  Cancelled: { bg: "rgba(220, 38, 38, 0.08)", text: "#b91c1c", dot: "#b91c1c" },
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
    } catch {}

    setMounted(true);

    fetch("/api/orders/list")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("fetch failed");
      })
      .then((data) => {
        const serverOrders: OrderRecord[] = data.orders ?? [];
        const merged = new Map<string, OrderRecord>();
        for (const o of [...localOrders, ...serverOrders]) {
          if (!merged.has(o.id)) merged.set(o.id, o);
          else merged.set(o.id, { ...merged.get(o.id)!, ...o });
        }
        const sorted = Array.from(merged.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      })
      .catch(() => {
        setOrders(localOrders);
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
      <section className="section">
        <div className="container max-w-2xl" style={{ paddingTop: '3rem', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text-dark)',
            marginBottom: '2rem',
          }}>
            My Orders
          </h1>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid var(--color-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto',
          }} />
        </div>
      </section>
    );
  }

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
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            background: 'var(--color-white-warm)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <Package size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-border-soft)' }} />
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>No orders yet</p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map((order) => {
              const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES["Order Confirmed"];

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'var(--color-white-warm)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xs)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                    }}>
                      <div>
                        <p style={{
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: statusStyle.dot,
                        }} />
                        {order.status}
                      </span>
                    </div>

                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      marginBottom: '0.75rem',
                      lineHeight: 1.4,
                    }}>
                      {order.items.map((item) => `${item.name} × ${item.qty}`).join(" · ")}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--color-border-soft)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-dark)',
                        }}>
                          ₹{order.total}
                        </span>
                        {(order.status === "Order Confirmed" || order.status === "Processing") && (
                          <button
                            onClick={() => openCancelModal(order)}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              color: '#b91c1c',
                              background: 'rgba(220, 38, 38, 0.06)',
                              border: '1px solid rgba(220, 38, 38, 0.15)',
                              borderRadius: 'var(--radius-full)',
                              padding: '0.25rem 0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.12)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.06)';
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      <Link
                        href={`/track?id=${order.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          transition: 'gap 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.gap = '0.5rem'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.gap = '0.25rem'; }}
                      >
                        Track Order <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: 'var(--color-natural-dark)',
          color: 'white',
          padding: '0.875rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          fontSize: 'var(--text-sm)',
          zIndex: 50,
          animation: 'bounce-once 0.5s ease forwards',
        }}>
          {toast}
        </div>
      )}

      {cancelModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(59, 46, 36, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--color-white-warm)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '28rem',
            width: '100%',
            padding: '1.75rem',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <button
              onClick={closeCancelModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <X size={18} />
            </button>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-dark)',
              marginBottom: '1.25rem',
              letterSpacing: 'var(--tracking-tight)',
            }}>
              Cancel Order #{cancelModal.id}
            </h2>

            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text-dark)',
              marginBottom: '0.5rem',
            }}>
              Reason for cancellation
            </label>
            <select
              className="input"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{ marginBottom: '0.75rem' }}
            >
              <option value="">Select a reason</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {cancelReason === "Other" && (
              <textarea
                className="input"
                rows={3}
                placeholder="Please tell us why..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{ marginBottom: '0.75rem', resize: 'vertical' }}
              />
            )}

            {cancelError && (
              <p style={{ color: '#b91c1c', fontSize: 'var(--text-sm)', marginBottom: '0.75rem' }}>{cancelError}</p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={closeCancelModal}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-soft)',
                  background: 'transparent',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-dark)',
                  cursor: 'pointer',
                }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: '#b91c1c',
                  color: 'white',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.6 : 1,
                }}
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
