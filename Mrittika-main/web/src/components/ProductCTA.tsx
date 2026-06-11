"use client";

import { useCart } from "@/lib/CartContext";
import styles from "./ProductCTA.module.css";

type ProductCTAProps = {
  productId: string;
};

export default function ProductCTA({ productId }: ProductCTAProps) {
  const { addItem } = useCart();

  return (
    <div className={styles.cta}>
      <button className="btn btn-primary btn-lg" onClick={() => addItem(productId)}>
        Add to Cart
      </button>
      <button className="btn btn-secondary btn-lg">Buy Now</button>
    </div>
  );
}
