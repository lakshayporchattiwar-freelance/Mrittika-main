"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { saveOrder, generateOrderId, type OrderItem, type Order } from "@/lib/orders";
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
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const shipping = 49;
  const total = subtotal + shipping;

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

  const placeOrder = async () => {
    const id = generateOrderId();
    const orderItems: OrderItem[] = items.map((item) => ({
      name: item.name,
      price: item.price,
      qty: item.quantity,
      image: item.image,
    }));
    const order: Order = {
      id,
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      items: orderItems,
      total,
      status: "Order Confirmed",
      trackingId: id,
    };
    await saveOrder(order);
    clearCart();
    return id;
  };

  const handlePlaceOrder = async () => {
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        const id = await placeOrder();
        router.push(`/order-success?id=${id}`);
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!apiBase || !key) {
        setError("Payment configuration is missing.");
        setPlacing(false);
        return;
      }

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

      const razorpayOrder = await response.json();

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Mrittika",
        description: "Skincare Ritual Checkout",
        order_id: razorpayOrder.id,
        handler: async () => {
          const id = await placeOrder();
          router.push(`/order-success?id=${id}`);
        },
        theme: { color: "#c1622b" },
      } satisfies RazorpayOptions;

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not available");
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPlacing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setError(message);
      setPlacing(false);
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
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
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
            {items.map((item) => (
              <div key={item.id} className={styles.row}>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span>₹{shipping}</span>
            </div>
            <div className={styles.total}>
              <span>Total</span>
              <span>₹{total}</span>
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
            <button
              className="btn btn-primary btn-lg"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
