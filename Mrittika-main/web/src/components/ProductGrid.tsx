import ProductCard from "@/components/ProductCard"
import { getShopProducts } from "@/lib/shopProducts"
import styles from "./ProductGrid.module.css"

export default async function ProductGrid() {
  const products = await getShopProducts()

  return (
    <div className={styles.productGrid}>
      {products.map((product, index) => (
        <div key={product.id} data-reveal>
          <ProductCard product={product} priority={index === 0} />
        </div>
      ))}
    </div>
  )
}
