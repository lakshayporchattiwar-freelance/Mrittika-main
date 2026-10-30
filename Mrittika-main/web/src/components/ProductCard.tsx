"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import WishlistButton from "@/components/WishlistButton";
import styles from "./ProductCard.module.css";
import type { ShopProduct } from "@/lib/shopProducts";

type ProductCardProps = {
  product: ShopProduct;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const isSoldOut = product.status === "Out of Stock" || (product.stockQuantity ?? 0) === 0;

  const displayImage =
    canHover && hovered && product.images.length > 1
      ? product.images[1]
      : product.images[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      qty: 1,
      image: product.image,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
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
    <Link href={`/product/${product.slug}`} className={styles.card}>
      <div
        className={styles.imageWrap}
        onMouseEnter={() => canHover && setHovered(true)}
        onMouseLeave={() => canHover && setHovered(false)}
      >
        <Image
          src={displayImage}
          alt={`${product.name}${product.shortDescription ? ", " + product.shortDescription : ""}`}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
        {product.isNew && <span className={styles.newBadge}>New</span>}
        {isSoldOut && <span className={styles.soldOutBadge}>Sold out</span>}
        <WishlistButton slug={product.slug} />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.desc}>{product.shortDescription}</p>
        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className={styles.comparePrice}>₹{product.comparePrice}</span>
          )}
        </div>
        <div className={styles.actions}>
          {isSoldOut ? (
            <button className={styles.btnSoldOut} disabled>
              Sold Out
            </button>
          ) : (
            <>
              <button className={styles.btnCart} onClick={handleAdd}>
                Add to Cart
              </button>
              <button
                className={styles.btnBuy}
                onClick={handleBuyNow}
                disabled={buyNowLoading}
              >
                {buyNowLoading ? "Processing..." : "Buy Now"}
              </button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
