"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";
import styles from "./ProductGallery.module.css";

type ProductGalleryProps = {
  product: Product;
};

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const images = product.images.length > 0 ? product.images : [product.image];

  const selectImage = (index: number) => {
    if (index === activeIndex) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTransitioning(false);
    }, 200);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <span className="badge">🌿 Natural</span>
        <div className={`${styles.mainImageInner} ${transitioning ? styles.fadeOut : styles.fadeIn}`}>
          <Image
            src={images[activeIndex]}
            alt={`${product.name} - image ${activeIndex + 1}`}
            fill
            className={styles.galleryImage}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={activeIndex === 0}
            loading={activeIndex === 0 ? "eager" : "lazy"}
          />
        </div>
      </div>
      <div className={styles.thumbs}>
        {images.map((img, index) => (
          <button
            key={index}
            className={`${styles.thumb} ${index === activeIndex ? styles.thumbActive : ""}`}
            onClick={() => selectImage(index)}
          >
            <Image src={img} alt={`${product.name} thumb ${index + 1}`} width={80} height={80} />
          </button>
        ))}
      </div>
    </div>
  );
}
