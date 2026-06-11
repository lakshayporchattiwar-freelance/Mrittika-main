"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: () => void) => void };
  }
}

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: RazorpayResponse) => void;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type PaymentModalProps = {
  razorpayOrderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentId: string, signature: string) => void;
  onFailure: (error: string) => void;
  onClose: () => void;
};

export default function PaymentModal({
  razorpayOrderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  onClose,
}: PaymentModalProps) {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  useEffect(() => {
    if (!key) {
      onFailure("Razorpay key not configured");
      return;
    }

    const loadRazorpay = () =>
      new Promise<void>((resolve, reject) => {
        if (window.Razorpay) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.body.appendChild(script);
      });

    loadRazorpay()
      .then(() => {
        if (!window.Razorpay) {
          onFailure("Razorpay SDK not available");
          return;
        }

        const options: RazorpayOptions = {
          key,
          amount,
          currency: "INR",
          name: "Mrittika",
          description: "Skincare Ritual Checkout",
          order_id: razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          handler: (response: RazorpayResponse) => {
            onSuccess(response.razorpay_payment_id, response.razorpay_signature);
          },
          theme: { color: "#c1622b" },
          modal: {
            ondismiss: () => {
              onClose();
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          onFailure("Payment failed. Please try again.");
        });
        rzp.open();
      })
      .catch((err: Error) => {
        onFailure(err.message);
      });
  }, [key, razorpayOrderId, amount, customerName, customerEmail, customerPhone, onSuccess, onFailure, onClose]);

  return (
    <div className="fixed inset-0 bg-[var(--color-overlay-dark)] z-50 flex items-center justify-center">
      <div className="bg-[var(--color-white-warm)] rounded-[var(--radius-lg)] p-8 max-w-md w-full text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-xl">Opening payment gateway...</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Please complete the payment in the Razorpay window
          </p>
        </div>
      </div>
    </div>
  );
}
