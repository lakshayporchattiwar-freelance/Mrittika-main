"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getOrderById, type Order } from "@/lib/orders";
import TruckAnimation from "@/components/TruckAnimation";
import styles from "./order-success.module.css";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("id") ?? "—";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const id = orderIdParam !== "—" ? orderIdParam : null;
    const fetchPromise = id
      ? getOrderById(id)
      : Promise.resolve(null);
    fetchPromise.then((found) => {
      setOrder(found);
      setLoading(false);
    });
  }, [orderIdParam]);

  const handleAnimComplete = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const orderId = order?.id ?? orderIdParam;
  const displayDate = order?.date ?? "—";

  return (
    <section className={`section ${styles.success}`}>
      <div className="container">
        <div className={styles.card}>
          {!showConfirmation && (
            <>
              <div className={styles.animWrap}>
                <TruckAnimation autoPlay onComplete={handleAnimComplete} />
              </div>
              <h1>Confirming your order...</h1>
              <p>Your ritual is being prepared</p>
            </>
          )}

          {showConfirmation && !loading && (
            <>
              <div className={styles.check}>✓</div>
              <h1>Order Placed Successfully!</h1>
              <p>Your ritual is on its way</p>

              <div className={styles.confirmationPanel}>
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Tracking ID</span>
                  <span className={styles.confirmValue}>{orderId}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Order Date</span>
                  <span className={styles.confirmValue}>{displayDate}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Delivery Status</span>
                  <span className={styles.statusBadge}>{order?.status ?? "Order Confirmed"}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>Est. Delivery</span>
                  <span className={styles.confirmValue}>3-5 business days</span>
                </div>
              </div>

              {order && (
                <div className={styles.items}>
                  {order.items.map((item, i) => (
                    <div key={i} className={styles.itemRow}>
                      <span>{item.name} × {item.qty}</span>
                      <span>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <Link href={`/track?id=${orderId}`} className="btn btn-secondary">
                  Track Order
                </Link>
                <Link href="/orders" className="btn btn-ghost">
                  My Orders
                </Link>
                <Link href="/shop" className="btn btn-ghost">
                  Continue Shopping
                </Link>
              </div>
              <a
                href="https://wa.me/916000386664"
                className="btn btn-primary"
                target="_blank"
                rel="noreferrer"
              >
                Share on WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container"><p>Loading...</p></div></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
