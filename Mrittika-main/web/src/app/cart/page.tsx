import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import styles from "./cart.module.css";

export default function CartPage() {
  const items = products.slice(0, 2);

  return (
    <section className={`section ${styles.cart}`}>
      <div className="container">
        <h1>Your Cart</h1>
        <div className={styles.grid}>
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <Image src={item.image} alt={item.name} width={120} height={140} />
                <div className={styles.itemInfo}>
                  <h3>{item.name}</h3>
                  <p className="text-muted">100g · Oily/Combination</p>
                  <div className={styles.qty}>
                    <button>-</button>
                    <span>1</span>
                    <button>+</button>
                  </div>
                </div>
                <div className={styles.price}>₹{item.price}</div>
                <button className={styles.remove}>×</button>
              </div>
            ))}
          </div>
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
      </div>
    </section>
  );
}
