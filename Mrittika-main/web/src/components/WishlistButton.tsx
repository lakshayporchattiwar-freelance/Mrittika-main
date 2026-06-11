"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { isInWishlist, addToWishlist, removeFromWishlist } from "@/lib/wishlist";
import styles from "./WishlistButton.module.css";

type WishlistButtonProps = {
  slug: string;
};

export default function WishlistButton({ slug }: WishlistButtonProps) {
  const [active, setActive] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setActive(isInWishlist(slug));
    const sync = () => setActive(isInWishlist(slug));
    window.addEventListener("wishlist-updated", sync);
    return () => window.removeEventListener("wishlist-updated", sync);
  }, [slug]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) {
      removeFromWishlist(slug);
      setActive(false);
      showToast("Removed from Wishlist");
    } else {
      addToWishlist(slug);
      setActive(true);
      showToast("Added to Wishlist");
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  return (
    <>
      <button
        className={styles.button}
        onClick={handleClick}
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={18}
          className={active ? styles.filled : styles.outline}
          fill={active ? "#c1622b" : "none"}
          stroke={active ? "#c1622b" : "currentColor"}
          strokeWidth={2}
        />
      </button>
      {toast && <div className={styles.toast}>{toast}</div>}
    </>
  );
}
