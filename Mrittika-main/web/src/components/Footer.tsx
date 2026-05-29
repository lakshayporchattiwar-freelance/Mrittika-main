import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <h2>Mrittika.</h2>
          <p>Rooted in nature. Refined by ritual.</p>
          <div className={styles.socials}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://wa.me/917385395360" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>

        <div>
          <h3>Quick Links</h3>
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div>
          <h3>Help</h3>
          <Link href="/contact">Contact</Link>
          <Link href="/policies/shipping">Shipping</Link>
          <Link href="/policies/refund">Refund</Link>
          <Link href="/policies/terms">Terms</Link>
        </div>

        <div>
          <h3>Legal</h3>
          <Link href="/policies/privacy">Privacy Policy</Link>
          <Link href="/policies/shipping">Shipping Policy</Link>
          <Link href="/policies/refund">Refund Policy</Link>
          <Link href="/policies/terms">Terms & Conditions</Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>Made with ❤ for Indian Skin · © 2026 Mrittika Wellness</span>
        <div className={styles.payments}>
          <span>Razorpay</span>
          <span>UPI</span>
          <span>Visa</span>
          <span>Mastercard</span>
          <span>COD</span>
        </div>
      </div>
    </footer>
  );
}
