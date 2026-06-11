"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import WishlistButton from "@/components/WishlistButton";
import styles from "./ProductCard.module.css";
import type { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);

  const displayImage =
    hovered && product.images.length > 1
      ? product.images[1]
      : product.images[0];

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className={styles.imageWrap}>
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
        <WishlistButton slug={product.slug} />
      </Link>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.desc}>{product.shortDescription}</p>
        <span className={styles.price}>₹{product.price}</span>
        <div className={styles.actions}>
          <button className={styles.btnCart} onClick={() => addItem(product.id)}>
            Add to Cart
          </button>
          <Link href={`/product/${product.slug}`} className={styles.btnBuy}>
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
