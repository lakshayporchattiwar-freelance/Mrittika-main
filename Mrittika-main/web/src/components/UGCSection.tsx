"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { ProductUgc } from "@/lib/ugc";
import styles from "./UGCSection.module.css";

export default function UGCSection({ items }: { items: ProductUgc[] }) {
  const [active, setActive] = useState<ProductUgc | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Customer Love</h2>
      <div className={styles.row} ref={containerRef}>
        {items.map((item) => (
          <button
            key={item.id}
            className={styles.tile}
            onClick={() => setActive(item)}
            aria-label={`Play video from ${item.name_handle || "customer"}`}
          >
            <div className={styles.thumbWrap}>
              {item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.name_handle || "Customer video"}
                  fill
                  className={styles.thumbImg}
                  loading="lazy"
                />
              ) : (
                <div className={styles.thumbPlaceholder} />
              )}
              <span className={styles.playIcon}>▶</span>
            </div>
            <div className={styles.meta}>
              {item.name_handle && <span className={styles.name}>{item.name_handle}</span>}
              {item.rating ? (
                <span className={styles.stars}>
                  {"★".repeat(item.rating)}
                  {"☆".repeat(5 - item.rating)}
                </span>
              ) : null}
              {item.quote && <p className={styles.quote}>&ldquo;{item.quote}&rdquo;</p>}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className={styles.lightbox}
          onClick={() => setActive(null)}
        >
          <button
            className={styles.close}
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            ×
          </button>
          <div
            className={styles.playerWrap}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={active.video_url}
              controls
              autoPlay
              playsInline
              className={styles.player}
            />
          </div>
        </div>
      )}
    </section>
  );
}
