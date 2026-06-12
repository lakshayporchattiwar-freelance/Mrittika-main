import Image from "next/image";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { HeroFramePlayer } from "@/components/HeroFramePlayer";
import VideoTestimonial from "@/components/VideoTestimonial";
import FloatingLeaves from "@/components/FloatingLeaves";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import FounderVideo from "@/components/FounderVideo";
import styles from "./page.module.css";

const valueProps = [
  {
    badge: "Botanicals",
    title: "Wild-Harvested Botanicals",
    text: "Sourced from trusted farms and forests, every ingredient is hand-selected to nourish Indian skin in every season.",
    image: "/images/botanicals.webp",
  },
  {
    badge: "Handmade",
    title: "Made in Small Batches",
    text: "Each ritual is blended in limited batches for freshness, aroma, and a sensorial experience that feels truly bespoke.",
    image: "/images/small-batches.webp",
  },
  {
    badge: "Indian Skin",
    title: "Formulated for Indian Skin",
    text: "Our rituals are crafted for humidity, heat, and the diverse undertones of Indian skin to keep your glow balanced year-round.",
    image: "/images/indian-skin.webp",
  },
];

export default function HomePage() {
  return (
    <ScrollRevealProvider>
      <div className="animate-page-in">
        <HeroFramePlayer />

        <section id="products" className={`section ${styles.featured} ${styles.scrollOffset}`}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <h2>Our Favourites</h2>
              <p className="text-muted">Bestsellers loved by Indian skin</p>
            </div>
            <ProductGrid />
            <div className={styles.center}>
              <Link href="/shop" className="btn btn-secondary">
                View All Products
              </Link>
            </div>
          </div>
        </section>

        <section className={`${styles.valueStrip}`} data-reveal>
          <div className="container">
            <div className={styles.stripGrid}>
              {valueProps.map((prop) => (
                <div key={prop.badge} className={styles.stripCard}>
                  <div className={styles.stripImage}>
                    <Image src={prop.image} alt={prop.title} fill className={styles.stripImg} sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <div className={styles.stripText}>
                    <span className="badge">{prop.badge}</span>
                    <h3>{prop.title}</h3>
                    <p>{prop.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className={`section ${styles.testimonials} ${styles.scrollOffset}`}>
          <div className="container" style={{ position: "relative" }}>
            <FloatingLeaves count={8} />
            <div className={styles.sectionHeading}>
              <h2>Hear From Our Community</h2>
              <p className="text-muted">Real stories from real people</p>
            </div>
            <div className={styles.videoSingle} data-reveal>
              <VideoTestimonial
                videoSrc="/testimonials/testimonial-1.webm"
              />
            </div>
          </div>
        </section>

        <section id="founder" className={`section ${styles.founder} ${styles.scrollOffset}`} data-reveal>
          <div className={`container ${styles.founderGrid}`}>
            <FounderVideo />
            <div className={styles.founderText}>
              <span className={styles.handwritten}>From the Founder</span>
              <h2>Why I Started Mrittika</h2>
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
              <span className={styles.signature}>— Charvi Kailash Khandar</span>
            </div>
          </div>
        </section>

      </div>
    </ScrollRevealProvider>
  );
}
