"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import FloatingLeaves from "@/components/FloatingLeaves";
import { HERO_FRAME_CONFIG, getFramePath, getFrameInterval } from "@/lib/heroFrameConfig";
import styles from "./HeroStory.module.css";

const TOTAL = HERO_FRAME_CONFIG.pcTotalFrames;
const INTERVAL = getFrameInterval();
const PRELOAD_AHEAD = HERO_FRAME_CONFIG.preloadBatchSize;

export default function HeroStory() {
  const imgRef = useRef<HTMLImageElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const img = imgRef.current;
    if (!img) return;

    const isMobile = window.innerWidth <= 768;
    const cache = new Map<number, HTMLImageElement>();
    let mounted = true;
    let rafId = 0;
    let lastTick = 0;
    let currentFrame = 0;

    function getOrLoad(n: number): HTMLImageElement {
      const existing = cache.get(n);
      if (existing) return existing;
      const i = new Image();
      i.decoding = "async";
      i.src = getFramePath(n, isMobile);
      cache.set(n, i);
      return i;
    }

    function isLoaded(n: number): boolean {
      const i = cache.get(n);
      return !!i && i.complete && i.naturalWidth > 0;
    }

    function preloadRange(from: number, count: number) {
      for (let i = 0; i < count; i++) {
        const n = ((from + i - 1) % TOTAL) + 1;
        getOrLoad(n);
      }
    }

    function advance(n: number) {
      currentFrame = n;
      img!.src = getFramePath(n, isMobile);
    }

    preloadRange(1, PRELOAD_AHEAD);

    let batchTimer: ReturnType<typeof setTimeout> | null = null;
    function scheduleBatches() {
      let batch = PRELOAD_AHEAD + 1;
      function doBatch() {
        if (!mounted || batch > TOTAL) return;
        preloadRange(batch, PRELOAD_AHEAD);
        batch += PRELOAD_AHEAD;
        batchTimer = setTimeout(doBatch, 300);
      }
      batchTimer = setTimeout(doBatch, 150);
    }
    scheduleBatches();

    const first = getOrLoad(1);

    function startLoop() {
      if (!mounted) return;
      advance(1);

      function tick(now: number) {
        if (!mounted) return;

        if (now - lastTick >= INTERVAL) {
          lastTick = now;
          const next = currentFrame >= TOTAL ? 1 : currentFrame + 1;

          if (isLoaded(next)) {
            advance(next);
          }

          if (next % 8 === 0) {
            preloadRange(next + 1, PRELOAD_AHEAD);
          }
        }

        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);
    }

    if (first.complete && first.naturalWidth > 0) {
      startLoop();
    } else {
      first.addEventListener("load", () => {
        if (mounted) startLoop();
      }, { once: true });
    }

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      if (batchTimer) clearTimeout(batchTimer);
    };
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.frameWrap}>
        <img ref={imgRef} alt="" className={styles.frameImg} aria-hidden="true" />
        <div className={styles.overlay} />
        <FloatingLeaves count={10} />
        <div className={styles.heroContent}>
          <h1 className={styles.heading}>Mrittika</h1>
          <p className={styles.tagline}>Natural Skincare Handcrafted for Indian Skin</p>
          <div className={styles.ctas}>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Shop Now
            </Link>
            <Link href="/about" className="btn btn-ghost btn-lg">
              Our Story
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.scrollCue}>
        <span>Discover More</span>
        <div className={styles.chevron} />
      </div>
    </section>
  );
}
