"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import FloatingLeaves from "@/components/FloatingLeaves";
import styles from "./HeroStory.module.css";

const TOTAL_FRAMES = 299;
const FPS = 24;
const FRAME_INTERVAL = 1000 / FPS;
const PRELOAD_WINDOW = 30;

function pad(n: number) {
  return String(n).padStart(4, "0");
}

function frameSrc(n: number) {
  return `/frames/webp_frame_${pad(n)}.webp`;
}

export default function HeroStory() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentRef = useRef(1);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);
  const resizeRef = useRef(0);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const img = imagesRef.current.get(currentRef.current);
    if (img && img.complete && img.naturalWidth > 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const preloadBatch = useCallback((from: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const n = ((from + i - 1) % TOTAL_FRAMES) + 1;
      if (imagesRef.current.has(n)) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(n);
      imagesRef.current.set(n, img);
    }
  }, []);

  useEffect(() => {
    preloadBatch(1, PRELOAD_WINDOW);
    for (let batch = 30; batch <= TOTAL_FRAMES; batch += 30) {
      setTimeout(() => preloadBatch(batch, PRELOAD_WINDOW), 100);
    }
  }, [preloadBatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (now: number) => {
      if (now - lastTickRef.current >= FRAME_INTERVAL) {
        lastTickRef.current = now;
        const next = currentRef.current >= TOTAL_FRAMES ? 1 : currentRef.current + 1;
        currentRef.current = next;

        const img = imagesRef.current.get(next);
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          preloadBatch(next + 1, 5);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const drawFirst = () => {
      const img = imagesRef.current.get(1);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    const firstImg = imagesRef.current.get(1);
    if (firstImg && firstImg.complete) {
      drawFirst();
    } else if (firstImg) {
      firstImg.addEventListener("load", drawFirst, { once: true });
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [preloadBatch]);

  return (
    <section className={styles.hero}>
      <div className={styles.frameWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.overlay} />
        <FloatingLeaves count={10} />
        <span className={styles.logo}>Mrittika.</span>
        <div className={styles.ctas}>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Shop Now
          </Link>
          <Link href="/about" className="btn btn-primary btn-lg">
            Our Story
          </Link>
        </div>
      </div>
      <div className={styles.scrollCue}>
        <span>Discover More</span>
        <div className={styles.chevron} />
      </div>
    </section>
  );
}
