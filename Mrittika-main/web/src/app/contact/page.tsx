import styles from "./contact.module.css";

export default function ContactPage() {
  return (
    <section className={`section ${styles.contact}`}>
      <div className="container">
        <div className={styles.grid}>
          <form className={styles.form}>
            <h1>Contact Us</h1>
            <p className="text-muted">
              We&apos;d love to guide your skincare ritual.
            </p>
            <input className="input" type="text" placeholder="Name" />
            <input className="input" type="email" placeholder="Email" />
            <input className="input" type="text" placeholder="Subject" />
            <textarea className="input" rows={5} placeholder="Message" />
            <button className="btn btn-primary">Send Message</button>
          </form>

          <div className={styles.info}>
            <h2>Reach us directly</h2>
            <p>WhatsApp: +91 7385395360</p>
            <p>Email: mrittikaskinrituals@gmail.com</p>
            <p>Address: Ahmedabad, Gujarat</p>
            <p>Working hours: 10 AM - 7 PM IST</p>
            <a
              href="https://wa.me/917385395360"
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </a>
            <div className={styles.map} />
          </div>
        </div>
      </div>
    </section>
  );
}
