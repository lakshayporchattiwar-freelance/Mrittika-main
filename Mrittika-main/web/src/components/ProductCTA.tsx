"use client";

import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import styles from "./ProductCTA.module.css";

type ProductCTAProps = {
  productId: string;
};

export default function ProductCTA({ productId }: ProductCTAProps) {
  const { addItem } = useCart();
  const product = products.find((p) => p.id === productId);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      qty: 1,
      image: product.image,
    });
  };

  return (
    <div className={styles.cta}>
      <button className="btn btn-primary btn-lg" onClick={handleAdd}>
        Add to Cart
      </button>
      <button className="btn btn-secondary btn-lg">Buy Now</button>
    </div>
  );
}
