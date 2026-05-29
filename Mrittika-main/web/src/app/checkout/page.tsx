"use client";

import { useState } from "react";
import styles from "./checkout.module.css";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme?: { color?: string };
};

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [error, setError] = useState<string | null>(null);
  const total = 1197;

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    setError(null);
    if (paymentMethod === "cod") {
      window.location.href = "/order-success";
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!apiBase || !key) {
      setError("Payment configuration is missing.");
      return;
    }

    try {
      await loadRazorpay();
      const response = await fetch(`${apiBase}/payments/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `mrittika_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create payment order");
      }

      const order = await response.json();

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Mrittika",
        description: "Skincare Ritual Checkout",
        order_id: order.id,
        handler: async (payment: RazorpayResponse) => {
          await fetch(`${apiBase}/payments/razorpay/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: order.id,
              payment_id: payment.razorpay_payment_id,
              signature: payment.razorpay_signature,
            }),
          });
          window.location.href = "/order-success";
        },
        theme: { color: "#c1622b" },
      } satisfies RazorpayOptions;

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not available");
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setError(message);
    }
  };

  return (
    <section className={`section ${styles.checkout}`}>
      <div className="container">
        <h1>Checkout</h1>
        <div className={styles.progress}>
          <span className={styles.active}>1. Address</span>
          <span>2. Payment</span>
          <span>3. Confirm</span>
        </div>
        <div className={styles.grid}>
          <form className={styles.form}>
            <h2>Shipping Address</h2>
            <div className={styles.fieldRow}>
              <input className="input" placeholder="First name" />
              <input className="input" placeholder="Last name" />
            </div>
            <input className="input" placeholder="Email address" />
            <input className="input" placeholder="Phone number" />
            <input className="input" placeholder="Address line 1" />
            <input className="input" placeholder="Address line 2" />
            <div className={styles.fieldRow}>
              <input className="input" placeholder="City" />
              <input className="input" placeholder="State" />
            </div>
            <div className={styles.fieldRow}>
              <input className="input" placeholder="PIN code" />
              <input className="input" placeholder="Country" />
            </div>
            <label className={styles.checkbox}>
              <input type="checkbox" /> Save this address for next time
            </label>
          </form>
          <div className={styles.summary}>
            <h2>Order Summary</h2>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>₹1,148</span>
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span>₹49</span>
            </div>
            <div className={styles.total}>
              <span>Total</span>
              <span>₹1,197</span>
            </div>
            <div className={styles.payment}>
              <h3>Payment Method</h3>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                Razorpay
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                Cash on Delivery
              </label>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
