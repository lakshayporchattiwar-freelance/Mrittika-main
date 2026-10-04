"use client";

import { useState, useEffect } from "react";
import { getShopProducts } from "@/lib/shopProducts"
import ProductCard from "@/components/ProductCard"
import styles from "./shop.module.css"

const categories = ["All", "Face", "Body", "Bundles"] as const
type Category = (typeof categories)[number]

const comingSoonCategories: Category[] = ["Bundles"]

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShopProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  const isComingSoon = comingSoonCategories.includes(activeCategory);
  const visibleProducts = isComingSoon ? [] : filteredProducts;

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
                className={`${styles.filter} ${activeCategory === label ? styles.filterActive : ""}`}
                onClick={() => setActiveCategory(label)}
              >
                {label}
                {label !== "All" && label !== "Bundles" && (
                  <span className={styles.count}>
                    {products.filter((p) => p.category === label).length}
                  </span>
                )}
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

        {isComingSoon ? (
          <div className={styles.comingSoon}>
            <span className={styles.comingSoonIcon}>🌿</span>
            <h2>Products Coming Soon</h2>
            <p className="text-muted">
              We&apos;re crafting something special for your skin. Stay tuned.
            </p>
          </div>
        ) : (
          <>
            <p className={styles.count}>
              Showing {visibleProducts.length} products
            </p>

            <div className={styles.grid}>
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index === 0} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
