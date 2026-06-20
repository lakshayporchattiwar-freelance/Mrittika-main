import type { Metadata } from "next";
import styles from "../[slug]/policy.module.css";

export const metadata: Metadata = {
  title: "Shipping Policy — Mrittika",
  description: "Learn about Mrittika's shipping timelines, delivery partners, and coverage across India.",
};

export default function ShippingPolicyPage() {
  return (
    <section className={`section ${styles.policy}`}>
      <div className="container">
        <div className={styles.content}>
          <h1>Shipping Policy</h1>
          <p className="text-muted">Last updated: June 2026</p>

          <h2>Delivery Timelines</h2>
          <p>
            We process all orders within 1–2 business days. Once dispatched,
            standard delivery takes <strong>5–7 business days</strong> across
            India, depending on your pin code and location.
          </p>

          <h2>Free Shipping</h2>
          <p>
            Enjoy <strong>free shipping</strong> on all orders above{" "}
            <strong>₹499</strong>. Orders below this threshold incur a flat
            shipping fee of ₹49.
          </p>

          <h2>Courier Partners</h2>
          <p>
            We partner with <strong>Delhivery</strong> and{" "}
            <strong>Shiprocket</strong> to ensure reliable, trackable delivery to
            your doorstep. You will receive a tracking link via SMS and email
            once your order is shipped.
          </p>

          <h2>Coverage</h2>
          <p>
            We deliver across India — from metro cities to tier-2 and tier-3
            towns. If you&apos;re unsure about delivery to your area, please
            reach out to us on WhatsApp.
          </p>

          <h2>International Shipping</h2>
          <p>
            We currently do <strong>not</strong> offer international shipping.
            We are working on it and hope to serve our global community soon.
          </p>

          <h2>Order Tracking</h2>
          <p>
            Once your order is dispatched, you can track it using the tracking
            link shared via SMS and email. If you face any issues with delivery,
            please contact us on <strong>WhatsApp at 6000386664</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
