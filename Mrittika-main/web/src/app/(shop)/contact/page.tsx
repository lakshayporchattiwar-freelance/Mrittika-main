"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Name, email, and message are required.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email.");
      return;
    }

    if (message.trim().length < 10) {
      setErrorMsg("Message must be at least 10 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setSuccessMsg("Thank you! We'll get back to you within 24 hours.");
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setErrorMsg("Failed to send message. Please try WhatsApp instead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`section ${styles.contact}`}>
      <div className="container">
        <div className={styles.grid}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1>Contact Us</h1>
            <p className="text-muted">
              We&apos;d love to guide your skincare ritual.
            </p>
            <input
              className="input"
              type="text"
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="input"
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="input"
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <textarea
              className="input"
              rows={5}
              placeholder="Message * (min 10 characters)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            {errorMsg && <p className={styles.error}>{errorMsg}</p>}
            {successMsg && <p className={styles.success}>{successMsg}</p>}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className={styles.info}>
            <div className={styles.heroImage}>
              <Image
                src="/images/contact-us.webp"
                alt="Contact Mrittika"
                width={600}
                height={400}
                className={styles.heroImageImg}
              />
            </div>
            <h2>Reach us directly</h2>
            <a
              href="https://wa.me/916000386664"
              className={styles.whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>+91 6000386664</span>
            </a>
            <p>Email: mrittikaskinrituals@gmail.com</p>
            <p>Address: Nagpur, Maharashtra</p>
            <p>Working hours: 10 AM - 7 PM IST</p>
            <a
              href="https://wa.me/916000386664"
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
