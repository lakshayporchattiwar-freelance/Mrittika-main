"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getOrderById, statusFlow, type Order, type OrderStatus } from "@/lib/orders";
import styles from "./track.module.css";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") ?? "";
  const [query, setQuery] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(!!initialId);

  useEffect(() => {
    if (initialId) {
      getOrderById(initialId).then((found) => {
        setOrder(found);
        setSearched(true);
        setLoading(false);
      });
    }
  }, [initialId]);

  const handleTrack = () => {
    const searchId = query.trim();
    if (!searchId) return;
    setLoading(true);
    getOrderById(searchId).then((found) => {
      setOrder(found);
      setSearched(true);
      setLoading(false);
    });
  };

  const getStepIndex = (status: OrderStatus): number => {
    return statusFlow.indexOf(status);
  };

  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <section className={`section ${styles.track}`}>
      <div className="container">
        <h1>Track Your Order</h1>

        <div className={styles.searchRow}>
          <input
            className="input"
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
          <div className={styles.notFound}>
            <p>Order not found. Please check your Order ID or contact us on WhatsApp: <a href="https://wa.me/916000386664" className={styles.whatsapp}>6000386664</a>.</p>
          </div>
        )}

        {order && (
          <div className={styles.result}>
            <div className={styles.orderSummary}>
              <div>
                <span className={styles.label}>Order ID</span>
                <span className={styles.value}>{order.id}</span>
              </div>
              <div>
                <span className={styles.label}>Order Date</span>
                <span className={styles.value}>{order.date}</span>
              </div>
              <div>
                <span className={styles.label}>Total</span>
                <span className={styles.value}>₹{order.total}</span>
              </div>
            </div>

            <div className={styles.tracker}>
              {statusFlow.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                const isLast = index === statusFlow.length - 1;

                return (
                  <div key={step} className={styles.stepRow}>
                    <div className={styles.stepDotWrap}>
                      <div
                        className={`${styles.stepDot} ${isCompleted ? styles.dotDone : ""} ${isCurrent ? styles.dotCurrent : ""}`}
                      >
                        {isCompleted && !isCurrent && (
                          <svg viewBox="0 0 12 10" className={styles.checkIcon}>
                            <polyline points="1.5 6 4.5 9 10.5 1" />
                          </svg>
                        )}
                      </div>
                      {!isLast && (
                        <div className={`${styles.stepLine} ${index < currentStep ? styles.lineDone : ""}`} />
                      )}
                    </div>
                    <div className={styles.stepContent}>
                      <span className={`${styles.stepLabel} ${isCompleted ? styles.labelDone : ""}`}>
                        {step}
                      </span>
                      {isCurrent && <span className={styles.currentBadge}>Current</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.estDelivery}>
              <span>Estimated delivery: 3-5 business days from order date</span>
            </div>

            <div className={styles.orderItems}>
              <h3>Items Ordered</h3>
              {order.items.map((item, i) => (
                <div key={i} className={styles.itemRow}>
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searched && !loading && (
          <p className={styles.hint}>Enter your order ID above to see the delivery status.</p>
        )}
      </div>
    </section>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container"><p>Loading...</p></div></div>}>
      <TrackContent />
    </Suspense>
  );
}
