import { notFound } from "next/navigation";
import styles from "./policy.module.css";

const policies = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "We respect your privacy and only collect information required to process your orders and improve your experience.",
      "Your data is stored securely and never sold to third parties.",
    ],
  },
  shipping: {
    title: "Shipping Policy",
    body: [
      "Orders are processed within 1-2 business days.",
      "Delivery timelines range between 3-7 business days depending on your location.",
    ],
  },
  refund: {
    title: "Refund Policy",
    body: [
      "We accept returns within 7 days of delivery for unopened products.",
      "Refunds are processed within 5-7 business days after inspection.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "By using this website, you agree to our terms of service.",
      "All content is owned by Mrittika and cannot be reproduced without permission.",
    ],
  },
};

type PolicySlug = keyof typeof policies;

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const policy = policies[params.slug as PolicySlug];

  if (!policy) {
    notFound();
  }

  return (
    <section className={`section ${styles.policy}`}>
      <div className="container">
        <div className={styles.content}>
          <h1>{policy.title}</h1>
          <p className="text-muted">Last updated: May 2026</p>
          {policy.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
