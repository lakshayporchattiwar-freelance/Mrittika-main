"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { getWishlist, removeFromWishlist } from "@/lib/wishlist";
import { products } from "@/data/products";
import { useCart } from "@/lib/CartContext";
import styles from "./wishlist.module.css";

export default function WishlistPage() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setSlugs(getWishlist());
    setMounted(true);
  }, []);

  const handleRemove = (slug: string) => {
    removeFromWishlist(slug);
    setSlugs(getWishlist());
  };

  const wishlisted = products.filter((p) => slugs.includes(p.slug));

  if (!mounted) return null;

  return (
    <section className={`section ${styles.wishlist}`}>
      <div className="container">
        <h1>Your Wishlist</h1>

        {wishlisted.length === 0 ? (
          <div className={styles.empty}>
            <Heart size={48} className={styles.emptyHeart} />
            <p>Your wishlist is empty</p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlisted.map((product) => (
              <div key={product.id} className={styles.card}>
                <div className={styles.imageWrap}>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className={styles.image}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(product.slug)}
                    aria-label="Remove from wishlist"
                  >
                    <Heart size={18} fill="#c1622b" stroke="#c1622b" strokeWidth={2} />
                  </button>
                </div>
                <div className={styles.body}>
                  <h3>{product.name}</h3>
                  <p className="text-muted">{product.shortDescription}</p>
                  <span className={styles.price}>₹{product.price}</span>
                  <div className={styles.actions}>
                    <button className={styles.btnCart} onClick={() => addItem(product.id)}>
                      Add to Cart
                    </button>
                    <Link href={`/product/${product.slug}`} className={styles.btnBuy}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
