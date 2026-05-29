import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import styles from "./product.module.css";

type ProductPageProps = {
  params: { slug: string };
};

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((item) => item.slug === params.slug);

  if (!product) {
    notFound();
  }

  return (
    <section className={`section ${styles.product}`}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> /{" "}
          <span>{product.name}</span>
        </div>

        <div className={styles.topGrid}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <span className="badge">🌿 Natural</span>
              <Image src={product.image} alt={product.name} width={520} height={620} />
            </div>
            <div className={styles.thumbs}>
              {[1, 2, 3, 4].map((index) => (
                <button key={index} className={styles.thumb}>
                  <Image src={product.image} alt={`${product.name} ${index}`} width={90} height={90} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.details}>
            <div className={styles.badges}>
              <span className="badge">Oily</span>
              <span className="badge">Combination</span>
            </div>
            <h1>{product.name}</h1>
            <div className={styles.rating}>
              ★★★★☆ {product.rating.toFixed(1)} · {product.reviewCount} Reviews
            </div>
            <div className={styles.price}>
              ₹{product.price} <span>₹{product.mrp}</span>
            </div>
            <div className={styles.variants}>
              <button className={styles.variant}>100g</button>
              <button className={styles.variant}>200g</button>
            </div>
            <div className={styles.quantity}>
              <button>-</button>
              <span>1</span>
              <button>+</button>
            </div>
            <div className={styles.cta}>
              <button className="btn btn-primary btn-lg">Add to Cart</button>
              <button className="btn btn-secondary btn-lg">Buy Now</button>
            </div>
            <div className={styles.trust}>
              <span>Free shipping</span>
              <span>Easy returns</span>
              <span>COD available</span>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <div className={styles.tabHeader}>
            {["Description", "Ingredients", "Benefits", "How to Use", "Reviews", "FAQ"].map(
              (tab) => (
                <button key={tab}>{tab}</button>
              )
            )}
          </div>
          <div className={styles.tabContent}>
            <h3>About this ritual</h3>
            <p>
              A luxurious ritual infused with turmeric, sandalwood, and rose
              petals to brighten, detoxify, and soften your skin.
            </p>
            <div className={styles.ingredientChips}>
              {["Saffron", "Rose Clay", "Neem", "Sandalwood"].map((item) => (
                <span key={item} className={styles.chip}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.related}>
          <h2>You Might Also Love</h2>
          <div className={styles.relatedGrid}>
            {products.map((item) => (
              <Link key={item.id} href={`/product/${item.slug}`} className={styles.relatedCard}>
                <Image src={item.image} alt={item.name} width={180} height={200} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
