import type { Metadata } from "next";
import styles from "../[slug]/policy.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions — Mrittika",
  description: "Terms and conditions for using the Mrittika website and purchasing natural skincare products.",
};

export default function TermsPage() {
  return (
    <section className={`section ${styles.policy}`}>
      <div className="container">
        <div className={styles.content}>
          <h1>Terms &amp; Conditions</h1>
          <p className="text-muted">Last updated: June 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Mrittika website (mrittika.in) and
            purchasing our products, you agree to be bound by these Terms &amp;
            Conditions. If you do not agree, please do not use our website or
            services.
          </p>

          <h2>2. Products &amp; Pricing</h2>
          <p>
            All product descriptions, images, and prices are subject to change
            without prior notice. We make every effort to display accurate
            colours and ingredients, but slight variations may occur due to
            natural ingredients and screen settings.
          </p>
          <p>
            Prices are listed in Indian Rupees (₹) and are inclusive of
            applicable taxes unless stated otherwise.
          </p>

          <h2>3. Orders &amp; Payment</h2>
          <p>
            Placing an order constitutes an offer to purchase. We reserve the
            right to refuse or cancel any order due to stock unavailability,
            pricing errors, or suspected fraudulent transactions.
          </p>
          <p>
            Payments are processed securely through Razorpay. We accept UPI,
            debit/credit cards, net banking, and cash on delivery (COD) where
            available.
          </p>

          <h2>4. Shipping &amp; Delivery</h2>
          <p>
            Delivery timelines are estimates and may vary based on location,
            courier availability, and unforeseen circumstances. Mrittika is not
            liable for delays caused by courier partners or force majeure
            events.
          </p>

          <h2>5. Returns &amp; Refunds</h2>
          <p>
            Returns and refunds are governed by our{" "}
            <a href="/policies/refund" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
              Refund Policy
            </a>
            . Please review it before making a purchase.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on this website — including text, images, logos, product
            descriptions, and designs — is the intellectual property of Mrittika
            Wellness Pvt. Ltd. and may not be reproduced, distributed, or used
            without written permission.
          </p>

          <h2>7. User Conduct</h2>
          <p>
            You agree not to misuse the website, submit false reviews, attempt
            unauthorized access, or engage in any activity that could harm,
            disable, or impair the site&apos;s functionality.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            Mrittika&apos;s liability for any claim arising from the use of our
            products or website shall not exceed the amount paid for the
            specific product in question. We are not liable for indirect,
            incidental, or consequential damages.
          </p>

          <h2>9. Skincare Disclaimer</h2>
          <p>
            Our products are made with natural ingredients, but individual skin
            reactions may vary. We recommend performing a patch test before
            first use. Discontinue use if irritation occurs and consult a
            dermatologist. Our products are not intended to diagnose, treat,
            cure, or prevent any medical condition.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be
            subject to the exclusive jurisdiction of the courts in Bengaluru,
            Karnataka.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may update these Terms &amp; Conditions from time to time.
            Continued use of the website after changes constitutes acceptance of
            the revised terms.
          </p>

          <h2>12. Contact</h2>
          <p>
            For any questions regarding these terms, reach out to us on{" "}
            <strong>WhatsApp at 6000386664</strong> or email us at
            support@mrittika.in.
          </p>
        </div>
      </div>
    </section>
  );
}
