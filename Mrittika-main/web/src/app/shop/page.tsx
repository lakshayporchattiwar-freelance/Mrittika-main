"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import styles from "./shop.module.css";

const categories = ["All", "Face", "Body", "Bundles"] as const;
type Category = (typeof categories)[number];

const comingSoonCategories: Category[] = ["Body", "Bundles"];

export default function ShopPage() {
  const [active, setActive] = useState<Category>("All");

  const isComingSoon = comingSoonCategories.includes(active);
  const visibleProducts =
    active === "All" || active === "Face" ? products : [];

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
                className={`${styles.filter} ${active === label ? styles.filterActive : ""}`}
                onClick={() => setActive(label)}
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

        {isComingSoon ? (
          <div className={styles.comingSoon}>
            <span className={styles.comingSoonIcon}>🌿</span>
            <h2>
              {active === "Body"
                ? "Body Rituals Coming Soon"
                : "Bundle Rituals Coming Soon"}
            </h2>
            <p className="text-muted">
              We&apos;re crafting something special for your skin. Stay tuned.
            </p>
            <div className={styles.notify}>
              <input
                className="input"
                type="email"
                placeholder="Enter your email for updates"
              />
              <button className="btn btn-primary">Notify Me</button>
            </div>
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

            <div className={styles.center}>
              <button className="btn btn-ghost">Load More Products</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
