import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getShopProducts } from "@/lib/shopProducts"
import { getUgcForProduct } from "@/lib/ugc"
import ProductCTA from "@/components/ProductCTA"
import ProductGallery from "@/components/ProductGallery"
import { ProductReviews } from "@/components/ReviewSection"
import LiveProductRating from "@/components/LiveProductRating"
import UGCSection from "@/components/UGCSection"
import styles from "./product.module.css"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getShopProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const products = await getShopProducts()
  const product = products.find((item) => item.slug === slug)
  if (!product) {
    return { title: "Product Not Found — Mrittika" }
  }
  return {
    title: `${product.name} — Mrittika`,
    description: product.description ?? product.shortDescription,
    openGraph: {
      title: `${product.name} — Mrittika`,
      description: product.shortDescription,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  }
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function AccordionItem({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details className={styles.accordionItem} open={defaultOpen}>
      <summary className={styles.accordionSummary}>{title}</summary>
      <div className={styles.accordionContent}>{children}</div>
    </details>
  )
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const products = await getShopProducts()
  const product = products.find((item) => item.slug === slug)

  if (!product) {
    notFound()
  }

  const ugcItems = await getUgcForProduct(product.slug)

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
              <LiveProductRating slug={product.slug} fallback={product.rating} />
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

        <UGCSection items={ugcItems} />

        <div className={styles.accordion}>
          <AccordionItem title="Description" defaultOpen>
            <p>{product.description ?? product.shortDescription}</p>
            {product.benefits && product.benefits.length > 0 && (
              <ul className={styles.benefitList}>
                {product.benefits.map((b, i) => (
                  <li key={i}>{renderBold(b)}</li>
                ))}
              </ul>
            )}
          </AccordionItem>

          {product.ingredients && product.ingredients.length > 0 && (
            <AccordionItem title="Ingredients">
              <ul className={styles.ingredientList}>
                {product.ingredients.map((item, i) => (
                  <li key={i}>{renderBold(item)}</li>
                ))}
              </ul>
            </AccordionItem>
          )}

          {product.howToUse && product.howToUse.length > 0 && (
            <AccordionItem title="How to Use">
              <ol className={styles.steps}>
                {product.howToUse.map((step, index) => (
                  <li key={index} className={styles.step}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </AccordionItem>
          )}

          {product.goodToKnow && (
            <AccordionItem title="Good to Know">
              <p style={{ whiteSpace: "pre-line" }}>{product.goodToKnow}</p>
            </AccordionItem>
          )}

          <AccordionItem title="Reviews">
            <ProductReviews productSlug={product.slug} />
          </AccordionItem>
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
  )
}
