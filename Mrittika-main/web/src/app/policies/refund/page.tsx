import type { Metadata } from "next";
import styles from "../[slug]/policy.module.css";

export const metadata: Metadata = {
  title: "Refund Policy — Mrittika",
  description: "Mrittika's return and refund policy — 7-day returns on damaged products, refunds via original payment method.",
};

export default function RefundPolicyPage() {
  return (
    <section className={`section ${styles.policy}`}>
      <div className="container">
        <div className={styles.content}>
          <h1>Refund &amp; Return Policy</h1>
          <p className="text-muted">Last updated: June 2026</p>

          <h2>Return Window</h2>
          <p>
            We accept returns within <strong>7 days</strong> of delivery for
            products that arrive <strong>damaged or defective</strong>. Please
            share an unboxing video or clear photos of the issue to initiate a
            return.
          </p>

          <h2>Non-Returnable Items</h2>
          <p>
            Due to hygiene and safety standards, we{" "}
            <strong>cannot accept returns on opened or used skincare
            products</strong>. If the seal is broken, the product is
            non-returnable unless it was received in a damaged condition.
          </p>

          <h2>Refund Process</h2>
          <p>
            Once your return is approved and the product is received at our
            facility, refunds are processed within{" "}
            <strong>5–7 business days</strong> via the{" "}
            <strong>original payment method</strong>. COD orders will be
            refunded via bank transfer upon providing valid bank details.
          </p>

          <h2>Exchanges</h2>
          <p>
            We currently do not offer direct exchanges. If you&apos;d like a
            different product, please return the original item for a refund and
            place a new order.
          </p>

          <h2>How to Initiate a Return</h2>
          <p>
            Contact us on <strong>WhatsApp at 6000386664</strong> with your
            order ID and photos of the issue. Our team will guide you through
            the process within 24–48 hours.
          </p>

          <h2>Cancellation</h2>
          <p>
            Orders can be cancelled before they are dispatched. Once shipped,
            the order cannot be cancelled — you may initiate a return after
            delivery following the process above.
          </p>
        </div>
      </div>
    </section>
  );
}
