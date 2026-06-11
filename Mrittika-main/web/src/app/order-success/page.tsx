"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { OrderRecord } from "@/lib/types";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") ?? "";
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setOrder(data ?? null))
        .catch(() => {});
    }
    const timer = setTimeout(() => setShowCheck(true), 300);
    return () => clearTimeout(timer);
  }, [orderId]);

  return (
    <section className="section min-h-[70vh] flex items-center justify-center bg-[var(--color-bg)]">
      <div className="container max-w-lg text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div
            className={`w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center transition-all duration-700 ${
              showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <svg
              className={`w-12 h-12 text-green-500 transition-all duration-500 delay-300 ${
                showCheck ? "opacity-100" : "opacity-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
        </div>

        <h1 className="font-display text-3xl mb-3">Your order has been placed!</h1>
        {orderId && (
          <p className="text-[var(--color-text-muted)] mb-2">
            Order ID: <strong className="text-[var(--color-text-dark)]">{orderId}</strong>
          </p>
        )}
        <p className="text-[var(--color-text-muted)] mb-8">
          We will deliver your order within 5-7 business days. You will receive tracking updates on your WhatsApp/email.
        </p>

        {order && (
          <div className="bg-[var(--color-white-warm)] rounded-lg p-4 mb-8 text-left text-sm space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.name} × {item.qty}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
            <hr className="border-[var(--color-border-soft)]" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href={`/track?id=${orderId}`}
            className="btn btn-primary btn-lg"
          >
            Track Your Order
          </Link>
          <Link href="/shop" className="btn btn-secondary btn-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="section min-h-[70vh] flex items-center justify-center">
          <div className="container text-center">
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
