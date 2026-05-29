import Link from "next/link";
import Image from "next/image";
import styles from "./ProductCard.module.css";
import type { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={product.image}
          alt={product.name}
          width={320}
          height={360}
          className={styles.image}
        />
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
      </div>
      <div className={styles.body}>
        <h3>{product.name}</h3>
        <p className={styles.desc}>{product.shortDescription}</p>
        <div className={styles.rating}>
          <span>★★★★★</span>
          <span>{product.rating.toFixed(1)}</span>
          <span className={styles.muted}>· {product.reviewCount} reviews</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price}</span>
          <span className={styles.mrp}>₹{product.mrp}</span>
        </div>
        <div className={styles.actions}>
          <button className="btn btn-secondary">Add to Cart</button>
          <Link href={`/product/${product.slug}`} className="btn btn-primary">
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
