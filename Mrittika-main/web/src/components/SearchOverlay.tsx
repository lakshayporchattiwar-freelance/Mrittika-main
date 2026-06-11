"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { products } from "@/data/products";
import styles from "./SearchOverlay.module.css";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.searchRow}>
          <svg viewBox="0 0 24 24" className={styles.searchIcon} aria-hidden="true">
            <circle cx="11" cy="11" r="7" strokeWidth="1.5" />
            <path d="M20 20L16.5 16.5" strokeWidth="1.5" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close search">
            ✕
          </button>
        </div>

        {query.trim() && results.length === 0 && (
          <div className={styles.empty}>
            <p>No products found for &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {results.length > 0 && (
          <div className={styles.results}>
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className={styles.result}
                onClick={onClose}
              >
                <div>
                  <span className={styles.resultName}>{product.name}</span>
                  <span className={styles.resultPrice}>₹{product.price}</span>
                </div>
                <span className={styles.resultDesc}>{product.shortDescription}</span>
              </Link>
            ))}
          </div>
        )}

        {!query.trim() && (
          <div className={styles.hint}>
            <p>Type to search across our collection</p>
          </div>
        )}
      </div>
    </div>
  );
}
