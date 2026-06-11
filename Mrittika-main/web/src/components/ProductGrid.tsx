"use client";

import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import styles from "./ProductGrid.module.css";

export default function ProductGrid() {
  return (
    <div className={styles.productGrid}>
      {products.map((product, index) => (
        <div key={product.id} data-reveal>
          <ProductCard product={product} priority={index === 0} />
        </div>
      ))}
    </div>
  );
}
