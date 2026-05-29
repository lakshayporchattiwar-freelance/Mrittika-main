import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import TrustStrip from "@/components/TrustStrip";
import { products } from "@/data/products";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <span className={styles.microLabel}>Pure Ritual Skincare</span>
            <h1 className={styles.heroTitle}>
              Rituals Rooted in
              <br />
              the Earth
            </h1>
            <p className={styles.heroBody}>
              Handcrafted in India with botanical ingredients for your unique
              skin. Soft, indulgent, and trusted by thousands of glowing
              customers.
            </p>
            <div className={styles.heroActions}>
              <Link href="/shop" className="btn btn-primary btn-lg">
                Shop Now
              </Link>
              <Link href="/about" className="btn btn-ghost btn-lg">
                Our Story
              </Link>
            </div>
            <div className={styles.socialProof}>★★★★★ · Loved by 10,000+ customers</div>
          </div>
          <div className={styles.heroImageWrap}>
            <Image
              src="/images/hero-product.svg"
              alt="Mrittika hero product"
              width={520}
              height={680}
              priority
              className={styles.heroImage}
            />
          </div>
        </div>
        <div className={styles.scrollCue}>
          <span>Discover More</span>
          <div className={styles.chevron} />
        </div>
      </section>

      <TrustStrip />

      <section className={`section ${styles.featured}`}>
        <div className="container">
          <div className={styles.sectionHeading}>
            <h2>Our Favourites</h2>
            <p className="text-muted">Bestsellers loved by Indian skin</p>
          </div>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className={styles.center}>
            <Link href="/shop" className="btn btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section className={`section ${styles.benefits}`}>
        <div className="container">
          <div className={styles.benefitRow}>
            <div className={styles.benefitImage} />
            <div className={styles.benefitText}>
              <span className="badge">Botanicals</span>
              <h3>Wild-Harvested Botanicals</h3>
              <p>
                Sourced from trusted farms and forests, every ingredient is
                hand-selected to nourish Indian skin in every season.
              </p>
            </div>
          </div>
          <div className={styles.benefitRowReverse}>
            <div className={styles.benefitText}>
              <span className="badge">Handmade</span>
              <h3>Made in Small Batches</h3>
              <p>
                Each ritual is blended in limited batches for freshness, aroma,
                and a sensorial experience that feels truly bespoke.
              </p>
            </div>
            <div className={styles.benefitImageAlt} />
          </div>
          <div className={styles.benefitRow}>
            <div className={styles.benefitImageSoft} />
            <div className={styles.benefitText}>
              <span className="badge">Indian Skin</span>
              <h3>Formulated for Indian Skin</h3>
              <p>
                Our rituals are crafted for humidity, heat, and the diverse
                undertones of Indian skin to keep your glow balanced year-round.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.testimonials}`}>
        <div className="container">
          <div className={styles.sectionHeading}>
            <h2>Real Results</h2>
            <p className="text-muted">Unfiltered reviews from real customers</p>
          </div>
          <div className={styles.testimonialGrid}>
            {[
              {
                name: "Priya M.",
                city: "Mumbai",
                quote:
                  "My skin feels softer in a week. The glow is real and the fragrance is divine.",
              },
              {
                name: "Ananya R.",
                city: "Bengaluru",
                quote:
                  "The Ubtan mask cleared my dullness without drying. Mrittika feels like a ritual.",
              },
              {
                name: "Kavya S.",
                city: "Delhi",
                quote:
                  "Love the earthy packaging and how the brand feels so personal.",
              },
            ].map((testimonial) => (
              <article key={testimonial.name} className={styles.testimonialCard}>
                <div className={styles.quoteMark}>“</div>
                <p>{testimonial.quote}</p>
                <div className={styles.stars}>★★★★★</div>
                <div className={styles.reviewMeta}>
                  <span>{testimonial.name}</span>
                  <span>· {testimonial.city}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.founder}`}>
        <div className={`container ${styles.founderGrid}`}>
          <Image
            src="/images/founder.svg"
            alt="Founder of Mrittika"
            width={420}
            height={520}
            className={styles.founderImage}
          />
          <div className={styles.founderText}>
            <span className={styles.handwritten}>From the Founder</span>
            <h2>Why I Started Mrittika</h2>
            <p>
              I wanted skincare that felt like a gentle ritual, not a chemical
              routine. Mrittika was born from my grandmother&apos;s recipes and
              a promise to keep every ingredient honest, clean, and
              soul-nourishing.
            </p>
            <p>
              Our mission is to make every woman feel rooted, confident, and
              luminous—naturally.
            </p>
            <span className={styles.signature}>— Charvi Kailas</span>
          </div>
        </div>
      </section>

      <section className={`section ${styles.instagram}`}>
        <div className="container">
          <div className={styles.sectionHeading}>
            <h2>Follow Our Journey @mrittika</h2>
            <p className="text-muted">
              A peek into our rituals, ingredients, and community.
            </p>
          </div>
          <div className={styles.instaGrid}>
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div key={id} className={styles.instaCard}>
                <Image
                  src={`/images/insta-${id}.svg`}
                  alt={`Instagram preview ${id}`}
                  width={260}
                  height={260}
                />
                <div className={styles.instaOverlay}>View on Instagram ↗</div>
              </div>
            ))}
          </div>
          <div className={styles.center}>
            <a
              href="https://instagram.com"
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
