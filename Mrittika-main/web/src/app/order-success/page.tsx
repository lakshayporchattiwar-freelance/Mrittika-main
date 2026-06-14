'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import DeliveryTracker from '@/components/DeliveryTracker';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'MRT-XXXXXXX';

  return (
    <section className="section">
      <div className="container max-w-lg" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div style={{
          background: 'var(--color-white-warm)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(90, 122, 80, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            animation: 'bounce-once 0.8s ease forwards',
          }}>
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

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-text-dark)',
            marginBottom: '0.5rem',
            letterSpacing: 'var(--tracking-tight)',
          }}>
            Order Placed Successfully!
          </h1>
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
            marginBottom: '2rem',
            lineHeight: 'var(--leading-normal)',
          }}>
            Thank you for choosing Mrittika. Your skin ritual is on its way!
          </p>

          <div style={{
            background: 'var(--color-cream-deep)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
          }}>
            <DeliveryTracker currentStage={0} animate showDeliveredMessage />
          </div>

          <div style={{
            border: '1px solid var(--color-border-soft)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Order ID</span>
              <span style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                color: 'var(--color-text-dark)',
              }}>
                {orderId}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Status</span>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                background: 'rgba(90, 122, 80, 0.1)',
                color: 'var(--color-natural-dark)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
              }}>
                Order Confirmed
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Est. Delivery</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dark)', fontWeight: 500 }}>
                5–7 business days
              </span>
            </div>
          </div>

          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            marginBottom: '1.75rem',
            lineHeight: 'var(--leading-normal)',
          }}>
            Track your order anytime from the Orders page. For help, WhatsApp us at{' '}
            <a
              href="https://wa.me/916000386664"
              style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
            >
              6000386664
            </a>
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/track?id=${orderId}`}
              className="btn btn-primary"
            >
              Track Order
            </Link>
            <Link
              href="/shop"
              className="btn btn-ghost"
            >
              Continue Shopping
            </Link>
          </div>
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
