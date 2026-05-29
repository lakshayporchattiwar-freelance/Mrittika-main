import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import styles from "./shop.module.css";

export default function ShopPage() {
  return (
    <section className={`section ${styles.shop}`}>
      <div className="container">
        <div className={styles.header}>
          <h1>Our Collection</h1>
          <p className="text-muted">Handcrafted for every skin type</p>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.filters}>
            {["All", "Face", "Body", "Hair", "Bundles"].map((label) => (
              <button key={label} className={styles.filter}>
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

        <p className={styles.count}>Showing {products.length} products</p>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className={styles.center}>
          <button className="btn btn-ghost">Load More Products</button>
        </div>
      </div>
    </section>
  );
}
