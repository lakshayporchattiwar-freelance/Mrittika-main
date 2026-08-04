import { getShopProducts } from "@/lib/shopProducts"
import ProductCard from "@/components/ProductCard"
import styles from "./shop.module.css"

const categories = ["All", "Face", "Body", "Bundles"] as const
type Category = (typeof categories)[number]

const comingSoonCategories: Category[] = ["Body", "Bundles"]

export default async function ShopPage() {
  const products = await getShopProducts()

  const visibleProducts = products

  return (
    <section className={`section ${styles.shop}`}>
      <div className="container">
        <div className={styles.header}>
          <h1>Our Collection</h1>
          <p className="text-muted">Handcrafted for every skin type</p>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.filters}>
            {categories.map((label) => (
              <button
                key={label}
                className={`${styles.filter} ${label === "All" || label === "Face" ? styles.filterActive : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.sort}>
            <label htmlFor="sort">Sort</label>
            <select id="sort" className={styles.select}>
              <option>Bestselling</option>
              <option>Price: Low to High</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {comingSoonCategories.includes("Body") ? null : null}

        <>
          <p className={styles.count}>
            Showing {visibleProducts.length} products
          </p>

          <div className={styles.grid}>
            {visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index === 0} />
            ))}
          </div>

          {visibleProducts.length === 0 && (
            <div className={styles.comingSoon}>
              <span className={styles.comingSoonIcon}>🌿</span>
              <h2>Products Coming Soon</h2>
              <p className="text-muted">
                We&apos;re crafting something special for your skin. Stay tuned.
              </p>
            </div>
          )}
        </>
      </div>
    </section>
  )
}
