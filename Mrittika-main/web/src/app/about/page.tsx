import Image from "next/image";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <section className={`section ${styles.about}`}>
      <div className="container">
        <div className={styles.hero}>
          <h1>The Story Behind the Earth</h1>
          <p className="text-muted">
            Mrittika is an ode to nature, heritage, and mindful skincare rituals
            handcrafted for Indian skin.
          </p>
        </div>

        <div className={styles.timeline}>
          {[
            { year: "2021", text: "A family recipe inspires the first batch." },
            { year: "2023", text: "Mrittika opens to the community." },
            { year: "2025", text: "10,000+ rituals delivered across India." },
          ].map((item) => (
            <div key={item.year} className={styles.timelineItem}>
              <span>{item.year}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.values}>
          {[
            { title: "Natural", body: "Only clean, honest ingredients." },
            { title: "Ethical", body: "Cruelty-free and earth-respectful." },
            { title: "Community", body: "Built on trust and transparency." },
          ].map((value) => (
            <div key={value.title} className={styles.valueCard}>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.team}>
          <Image src="/images/founder.svg" alt="Founder" width={360} height={420} />
          <div>
            <h2>Meet the Founder</h2>
            <p>
              Charvi Kailas blends ancestral wisdom with modern formulation
              standards, ensuring every ritual feels personal and premium.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
