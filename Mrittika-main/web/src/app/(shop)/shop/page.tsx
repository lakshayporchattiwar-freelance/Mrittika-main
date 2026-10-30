"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getShopProducts } from "@/lib/shopProducts";
import ProductCard from "@/components/ProductCard";
import styles from "./shop.module.css";

const categories = ["All", "Face", "Body", "Bundles"] as const;
type Category = (typeof categories)[number];

const comingSoonCategories: Category[] = ["Bundles"];

type SortOption = "bestselling" | "price-asc" | "price-desc" | "newest";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("bestselling");

  useEffect(() => {
    getShopProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    let list =
      activeCategory === "All"
        ? products
        : products.filter((p) => p.category === activeCategory);

    if (comingSoonCategories.includes(activeCategory)) {
      list = [];
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.reverse();
        break;
      default:
        break;
    }
    return sorted;
  }, [products, activeCategory, sort]);

  const isComingSoon = comingSoonCategories.includes(activeCategory);

  if (loading) {
    return (
      <section className={`section ${styles.shop}`}>
        <div className="container">
          <p>Loading products…</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`section ${styles.shop}`}>
      <div className="container">
        <div className={styles.header}>
          <h1>Shop</h1>
          <p className="text-muted">Handcrafted skincare for every skin type</p>
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
            <select
              id="sort"
              className={styles.select}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              <option value="bestselling">Bestselling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
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
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No products yet</h2>
            <p className="text-muted">We&apos;re preparing our collection. Please check back soon.</p>
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.count}>Showing {filteredProducts.length} products</p>
            <div className={styles.grid}>
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
