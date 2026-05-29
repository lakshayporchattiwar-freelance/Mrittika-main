import Link from "next/link";
import styles from "./order-success.module.css";

export default function OrderSuccessPage() {
  return (
    <section className={`section ${styles.success}`}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.check}>✓</div>
          <h1>Order Placed!</h1>
          <p>Your ritual is on its way 🌿</p>
          <div className={styles.meta}>
            <span>Order ID: MR-2026-0012</span>
            <span>Estimated delivery: 3-5 days</span>
          </div>
          <div className={styles.actions}>
            <Link href="/shop" className="btn btn-secondary">
              Track Order
            </Link>
            <Link href="/shop" className="btn btn-ghost">
              Continue Shopping
            </Link>
          </div>
          <a
            href="https://wa.me/917385395360"
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            Share on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
