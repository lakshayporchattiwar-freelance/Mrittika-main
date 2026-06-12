"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import styles from "./ProductCTA.module.css";

type ProductCTAProps = {
  productId: string;
};

export default function ProductCTA({ productId }: ProductCTAProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const product = products.find((p) => p.id === productId);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

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

  const handleBuyNow = async () => {
    if (!product) return;
    setBuyNowLoading(true);
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      qty: 1,
      image: product.image,
    });
    router.push("/checkout");
  };

  return (
    <div className={styles.cta}>
      <button className="btn btn-primary btn-lg" onClick={handleAdd}>
        Add to Cart
      </button>
      <button
        className="btn btn-secondary btn-lg"
        onClick={handleBuyNow}
        disabled={buyNowLoading}
      >
        {buyNowLoading ? "Processing..." : "Buy Now"}
      </button>
    </div>
  );
}
