'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import DeliveryTracker from '@/components/DeliveryTracker';
import styles from './order-success.module.css';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'MRT-XXXXXXX';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!orderId || orderId === 'MRT-XXXXXXX') return;

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.customer?.email) {
          localStorage.setItem('mrittika_customer_email', data.customer.email.trim().toLowerCase());
        }
      })
      .catch((err) => console.error('Failed to fetch order for email storage:', err));
  }, [orderId]);

  return (
    <section className={styles.success}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-natural-dark)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className={styles.title}>Order Placed Successfully!</h1>
        <p className={styles.subtitle}>
          Thank you for choosing Mrittika. Your skin ritual is on its way!
        </p>

        <div className={styles.trackerWrap}>
          <DeliveryTracker currentStage={0} animate showDeliveredMessage />
        </div>

        <div className={styles.detailsCard}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Order ID</span>
            <span className={styles.detailValue}>{orderId}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.statusBadge}>Order Confirmed</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Est. Delivery</span>
            <span className={styles.detailValue}>5–7 business days</span>
          </div>
        </div>

        <p className={styles.note}>
          Track your order anytime from the Orders page. For help, WhatsApp us at{' '}
          <a href="https://wa.me/916000386664">6000386664</a>
        </p>

        <div className={styles.actions}>
          <Link href={`/track?id=${orderId}`} className="btn btn-primary">
            Track Order
          </Link>
          <Link href="/shop" className="btn btn-ghost">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '2px solid var(--color-primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
