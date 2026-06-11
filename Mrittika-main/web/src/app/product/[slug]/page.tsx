import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products } from "@/data/products";
import ProductCTA from "@/components/ProductCTA";
import ProductGallery from "@/components/ProductGallery";
import ReviewSection from "@/components/ReviewSection";
import styles from "./product.module.css";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) {
    return { title: "Product Not Found — Mrittika" };
  }
  return {
    title: `${product.name} — Mrittika`,
    description: product.description ?? product.shortDescription,
    openGraph: {
      title: `${product.name} — Mrittika`,
      description: product.shortDescription,
      images: [
        {
          url: `https://mrittika-main.vercel.app${product.image}`,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

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
          <ProductGallery product={product} />

          <div className={styles.details}>
            <div className={styles.badges}>
              <span className="badge">Natural</span>
              <span className="badge">Handcrafted</span>
            </div>
            <h1>{product.name}</h1>
            <div className={styles.rating}>
              ★★★★☆ {product.rating.toFixed(1)}
            </div>
            <div className={styles.price}>
              ₹{product.price}
            </div>
            <ProductCTA productId={product.id} />
            <div className={styles.trust}>
              <span>Free shipping</span>
              <span>Easy returns</span>
              <span>COD available</span>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <div className={styles.tabHeader}>
            {["Description", "Ingredients", "How to Use", "Reviews"].map(
              (tab) => (
                <button key={tab}>{tab}</button>
              )
            )}
          </div>
          <div className={styles.tabContent}>
            <h3>About this ritual</h3>
            <p>
              {product.description ?? product.shortDescription}
            </p>

            {product.ingredients && (
              <div className={styles.ingredientSection}>
                <h3>Key Ingredients</h3>
                <div className={styles.ingredientChips}>
                  {product.ingredients.map((item) => (
                    <span key={item} className={styles.chip}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.howToUse && (
              <div className={styles.howToUseSection}>
                <h3>How to Use</h3>
                <ol className={styles.steps}>
                  {product.howToUse.map((step, index) => (
                    <li key={index} className={styles.step}>
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <ReviewSection productSlug={product.slug} />
          </div>
        </div>

        <div className={styles.related}>
          <h2>You Might Also Love</h2>
          <div className={styles.relatedGrid}>
            {products
              .filter((item) => item.slug !== product.slug)
              .slice(0, 3)
              .map((item) => (
                <Link key={item.id} href={`/product/${item.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImageWrap}>
                    <Image src={item.image} alt={item.name} fill className={styles.relatedImage} sizes="(max-width: 768px) 50vw, 180px" loading="lazy" />
                  </div>
                  <span>{item.name}</span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
