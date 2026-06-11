"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./cart.module.css";

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart();
  const shipping = total >= 499 ? 0 : 49;
  const grandTotal = total + shipping;

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
              <div className={styles.row}>
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className={styles.total}>
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
              <div className={styles.coupon}>
                <input className="input" placeholder="Coupon code" />
                <button className="btn btn-ghost">Apply</button>
              </div>
              <Link href="/checkout" className="btn btn-primary btn-lg">
                Proceed to Checkout
              </Link>
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
