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
              <div className={styles.timelineLine} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineYear}>{item.year}</span>
                <p>{item.text}</p>
              </div>
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

        <div className={styles.founder}>
          <div className={styles.founderMedia}>
            <Image
              src="/images/founder.svg"
              alt="Charvi Kailash Khandar"
              width={400}
              height={480}
              className={styles.founderImage}
            />
            <video
              src="/founder/founder-video.webm"
              controls
              className={styles.founderVideo}
            />
          </div>
          <div className={styles.founderBio}>
            <span className={styles.founderLabel}>Meet the Founder</span>
            <h2>Charvi Kailash Khandar</h2>
            <span className={styles.founderTitle}>
              Founder &amp; Formulator, Mrittika
            </span>
            <div className={styles.founderStory}>
              <p>
                Hi, I&apos;m the founder of Mrittika.
              </p>
              <p>
                Like many people, I struggled to find skincare products that
                genuinely helped with tanning and dull skin without feeling harsh
                or overly complicated. I wanted products that were inspired by
                nature, easy to use, and something I could trust myself.
              </p>
              <p>
                That&apos;s how Mrittika was born.
              </p>
              <p>
                What started as a personal quest soon became a mission to create
                skincare that helps people feel confident in their own skin. Every
                product is developed with care, keeping one simple goal in mind: to
                deliver effective skincare while staying connected to the goodness
                of natural ingredients.
              </p>
              <p>
                Mrittika isn&apos;t just a brand for me—it&apos;s a journey of
                learning, creating, and sharing products that I truly believe in.
              </p>
              <p>
                Thank you for trusting us and being a part of this story.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
