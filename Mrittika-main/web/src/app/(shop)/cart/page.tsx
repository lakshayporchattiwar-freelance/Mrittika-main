"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import styles from "./cart.module.css";

export default function CartPage() {
  const { items, removeItem, updateQty, total, mounted, appliedCoupon, setAppliedCoupon } = useCart();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const shipping = total >= 499 ? 0 : 49;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = total - discountAmount + shipping;

  async function handleApplyCoupon() {
    const trimmed = couponCode.trim();
    if (!trimmed) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      let storedEmail = "";
      try { storedEmail = localStorage.getItem("mrittika_customer_email") || ""; } catch {}

      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, subtotal: total, email: storedEmail }),
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          message: data.message,
        });
        setCouponCode("");
      } else {
        setCouponError(data.error || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
  }

  if (!mounted) {
    return (
      <section className={`section ${styles.cart}`}>
        <div className="container">
          <h1>Your Cart</h1>
          <div className={styles.empty}>
            <p>Loading your cart…</p>
          </div>
        </div>
      </section>
    );
  }

  const handleCheckout = () => {
    setCheckingOut(true);
    router.push("/checkout");
  };

  return (
    <section className={`section ${styles.cart}`}>
      <div className="container">
        <h1>Your Cart</h1>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty</p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImageWrap}>
                    <Image src={item.image} alt={item.name} fill className={styles.itemImage} sizes="100px" />
                  </div>
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    <p className="text-muted">100g</p>
                    <div className={styles.qty}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                  <div className={styles.price}>₹{item.price * item.qty}</div>
                  <button className={styles.remove} onClick={() => removeItem(item.id)}>×</button>
                </div>
              ))}
            </div>
            <div className={styles.summary}>
              <h2>Order Summary</h2>
              <div className={styles.row}>
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              {appliedCoupon && (
                <div className={`${styles.row} ${styles.couponRow}`}>
                  <span>Coupon ({appliedCoupon.code}) <button className={styles.removeCoupon} onClick={handleRemoveCoupon}>Remove</button></span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className={styles.row}>
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className={styles.total}>
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
              {!appliedCoupon && (
                <div className={styles.coupon}>
                  <div className={styles.couponInput}>
                    <input
                      className="input"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <button
                      className="btn btn-ghost"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className={styles.couponError}>{couponError}</p>}
                </div>
              )}
              {appliedCoupon && (
                <p className={styles.couponSuccess}>{appliedCoupon.message}</p>
              )}
              <button
                className="btn btn-primary btn-lg"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? "Processing..." : "Proceed to Checkout"}
              </button>
              <div className={styles.payments}>
                <span>Razorpay</span>
                <span>UPI</span>
                <span>COD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
