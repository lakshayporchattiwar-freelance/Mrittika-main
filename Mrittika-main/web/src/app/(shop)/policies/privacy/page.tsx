import type { Metadata } from "next";
import styles from "../[slug]/policy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Mrittika",
  description: "Mrittika's privacy policy — how we collect, use, and protect your personal data in compliance with DPDP 2023.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className={`section ${styles.policy}`}>
      <div className="container">
        <div className={styles.content}>
          <h1>Privacy Policy</h1>
          <p className="text-muted">Last updated: June 2026</p>

          <h2>1. Introduction</h2>
          <p>
            Mrittika Wellness Pvt. Ltd. (&quot;we&quot;, &quot;us&quot;,
            &quot;our&quot;) is committed to protecting your personal data in
            compliance with the <strong>Digital Personal Data Protection Act,
            2023 (DPDP 2023)</strong>. This policy explains what data we
            collect, how we use it, and your rights as a data principal.
          </p>

          <h2>2. Data We Collect</h2>
          <p>We collect the following personal data when you use our website or place an order:</p>
          <ul>
            <li><strong>Identity Data:</strong> Full name</li>
            <li><strong>Contact Data:</strong> Email address, phone number</li>
            <li><strong>Address Data:</strong> Shipping and billing address</li>
            <li><strong>Payment Data:</strong> Payment method details (processed securely by Razorpay — we do not store card/bank details)</li>
            <li><strong>Usage Data:</strong> Browsing patterns, device info, and cookies</li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>We use your personal data solely for the following lawful purposes:</p>
          <ul>
            <li>Processing and fulfilling your orders</li>
            <li>Communicating order updates, shipping notifications, and delivery tracking</li>
            <li>Providing customer support</li>
            <li>Sending promotional offers and updates (only with your consent)</li>
            <li>Improving our website, products, and services</li>
          </ul>

          <h2>4. Legal Basis for Processing</h2>
          <p>
            We process your data under the following lawful bases as defined by
            the DPDP 2023:
          </p>
          <ul>
            <li><strong>Consent:</strong> For marketing communications and non-essential cookies</li>
            <li><strong>Contractual Necessity:</strong> To process and deliver your orders</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable Indian laws</li>
          </ul>

          <h2>5. Third-Party Sharing</h2>
          <p>
            We do <strong>not</strong> sell, rent, or share your personal data
            with third parties for marketing purposes. We share data only with:
          </p>
          <ul>
            <li><strong>Logistics partners</strong> (Delhivery, Shiprocket) — name, phone, and delivery address for order fulfillment</li>
            <li><strong>Payment processor</strong> (Razorpay) — transaction data for secure payment processing</li>
            <li><strong>Legal authorities</strong> — when required by law or to protect our rights</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to
            fulfill the purposes outlined in this policy, or as required by
            law. Order-related data is retained for a minimum of 3 years for
            tax and legal compliance.
          </p>

          <h2>7. Data Security</h2>
          <p>
            We implement industry-standard security measures including SSL
            encryption, secure servers, and access controls to protect your
            data from unauthorized access, disclosure, or destruction.
          </p>

          <h2>8. Your Rights (DPDP 2023)</h2>
          <p>As a data principal under the DPDP 2023, you have the right to:</p>
          <ul>
            <li>Access and receive a copy of your personal data</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request erasure of your data (subject to legal obligations)</li>
            <li>Withdraw consent for data processing at any time</li>
            <li>Nominate another person to exercise your rights on your behalf</li>
            <li>Lodge a complaint with the Data Protection Board of India</li>
          </ul>

          <h2>9. Cookies</h2>
          <p>
            We use essential cookies to operate the website and optional
            analytics cookies to understand usage patterns. You can manage your
            cookie preferences through your browser settings.
          </p>

          <h2>10. Children&apos;s Data</h2>
          <p>
            Our products and website are not directed at individuals under the
            age of 18. We do not knowingly collect personal data from children.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this privacy policy periodically. Significant changes
            will be communicated via email or website notice. Continued use of
            our services constitutes acceptance of the updated policy.
          </p>

          <h2>12. Contact</h2>
          <p>
            For data-related queries or to exercise your rights, contact our
            Data Protection Officer at{" "}
            <strong>privacy@mrittika.in</strong> or message us on{" "}
            <strong>WhatsApp at 6000386664</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
