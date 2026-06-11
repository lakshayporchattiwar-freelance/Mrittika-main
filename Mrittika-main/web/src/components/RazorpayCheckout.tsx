"use client";

import Script from "next/script";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { CustomerInfo } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: () => void) => void };
  }
}

type RazorpayCheckoutProps = {
  customerInfo: CustomerInfo;
  total: number;
  onSuccess: (orderId: string) => void;
  onError: (msg: string) => void;
};

export default function RazorpayCheckout({
  customerInfo,
  total,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { items, clearCart } = useCart();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const internalOrderId = `MRT-${Date.now()}`;

      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total * 100,
          receipt: internalOrderId,
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || "Failed to create order");
      }

      const { orderId } = await createRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "Mrittika",
        description: "Natural Skincare Ritual",
        image: "/images/mrittika-logo.png",
        order_id: orderId,
        prefill: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: { color: "#8B4513" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: { items, customer: customerInfo, total },
                internalOrderId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              clearCart();
              onSuccess(internalOrderId);
            } else {
              onError(verifyData.error || "Payment verification failed");
            }
          } catch {
            onError("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            onError("Payment cancelled");
          },
        },
      };

      if (!window.Razorpay) {
        onError("Payment gateway not loaded. Please refresh and try again.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-4 rounded-lg bg-[#8B4513] text-white font-semibold text-lg hover:bg-[#6d3510] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : `Pay ₹${total}`}
      </button>
    </>
  );
}
