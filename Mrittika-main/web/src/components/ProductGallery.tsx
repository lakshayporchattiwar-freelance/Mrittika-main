"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ShopProduct } from "@/lib/shopProducts";
import styles from "./ProductGallery.module.css";

type ProductGalleryProps = {
  product: ShopProduct;
};

export default function ProductGallery({ product }: ProductGalleryProps) {
  const images = product.images.length > 0 ? product.images : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const selectImage = (index: number) => {
    if (index === activeIndex) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTransitioning(false);
    }, 200);
  };

  const goPrev = useCallback(() => {
    selectImage(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  }, [activeIndex, images.length]);

  const goNext = useCallback(() => {
    selectImage(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setZoomed(false);
      } else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goPrev, goNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const hasMultiple = images.length > 1;

  return (
    <div className={styles.gallery}>
      <div
        className={styles.mainImage}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <span className="badge">🌿 Natural</span>
        <div
          className={`${styles.mainImageInner} ${transitioning ? styles.fadeOut : styles.fadeIn}`}
          onClick={() => setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open image fullscreen"
        >
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
        {hasMultiple && (
          <>
            <button
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <>
          <div className={styles.thumbs}>
            {images.map((img, index) => (
              <button
                key={index}
                className={`${styles.thumb} ${index === activeIndex ? styles.thumbActive : ""}`}
                onClick={() => selectImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumb ${index + 1}`}
                  width={80}
                  height={80}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          <div className={styles.dots}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
                onClick={() => selectImage(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {lightboxOpen && (
        <div
          className={styles.lightbox}
          onClick={() => {
            setLightboxOpen(false);
            setZoomed(false);
          }}
        >
          <button
            className={styles.lightboxClose}
            onClick={() => {
              setLightboxOpen(false);
              setZoomed(false);
            }}
            aria-label="Close"
          >
            ×
          </button>
          {hasMultiple && (
            <>
              <button
                className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
          <div
            className={styles.lightboxImageWrap}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
          >
            <Image
              src={images[activeIndex]}
              alt={`${product.name} - image ${activeIndex + 1}`}
              fill
              className={`${styles.lightboxImage} ${zoomed ? styles.lightboxZoomed : ""}`}
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
