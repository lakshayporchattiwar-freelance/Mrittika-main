'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  HERO_FRAME_CONFIG,
  getFramePath,
  getTotalFrames,
} from '@/lib/heroFrameConfig';

export function HeroFramePlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const frameRef = useRef(1);
  const lastTickRef = useRef(0);
  const cacheRef = useRef(new Map<number, HTMLImageElement>());
  const isMobileRef = useRef(false);
  const playingRef = useRef(false);
  const loaderHiddenRef = useRef(false);
  const sizeRef = useRef({ cw: 1, ch: 1, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const mql = window.matchMedia(
      `(max-width: ${HERO_FRAME_CONFIG.mobileBreakpoint}px)`
    );
    isMobileRef.current = mql.matches;

    function syncCanvasSize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      const cw = Math.max(1, Math.round(rect.width));
      const ch = Math.max(1, Math.round(rect.height));
      if (
        sizeRef.current.cw !== cw ||
        sizeRef.current.ch !== ch ||
        sizeRef.current.dpr !== dpr
      ) {
        sizeRef.current = { cw, ch, dpr };
        canvas!.width = Math.round(cw * dpr);
        canvas!.height = Math.round(ch * dpr);
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    function isFrameReady(n: number): boolean {
      const img = cacheRef.current.get(n);
      return !!img && img.complete && img.naturalWidth > 0;
    }

    function preloadFrame(n: number, mobile: boolean): HTMLImageElement {
      const existing = cacheRef.current.get(n);
      if (existing) return existing;
      const img = new Image();
      img.src = getFramePath(n, mobile);
      cacheRef.current.set(n, img);
      return img;
    }

    function preloadRange(
      from: number,
      count: number,
      mobile: boolean,
      total: number
    ) {
      for (let i = 0; i < count; i++) {
        const n = from + i;
        if (n <= total) preloadFrame(n, mobile);
      }
    }

    function drawFrame(n: number) {
      const img = cacheRef.current.get(n);
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const { cw, ch } = sizeRef.current;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const imgAspect = iw / ih;
      const canAspect = cw / ch;

      let sx: number, sy: number, sw: number, sh: number;

      if (imgAspect > canAspect) {
        sh = ih;
        sw = ih * canAspect;
        sx = (iw - sw) / 2;
        sy = 0;
      } else {
        sw = iw;
        sh = iw / canAspect;
        sx = 0;
        sy = (ih - sh) / 2;
      }

      ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    }

    function hideLoader() {
      if (loaderHiddenRef.current) return;
      loaderHiddenRef.current = true;
      const loader = loaderRef.current;
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 500);
      }
    }

    function beginAnimation() {
      if (playingRef.current) return;
      playingRef.current = true;
      syncCanvasSize();
      drawFrame(1);
      hideLoader();
      lastTickRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }

    function tick(now: number) {
      const interval = 1000 / HERO_FRAME_CONFIG.fps;
      const elapsed = now - lastTickRef.current;

      if (elapsed >= interval) {
        lastTickRef.current = now - (elapsed % interval);
        const total = getTotalFrames(isMobileRef.current);
        const next = frameRef.current >= total ? 1 : frameRef.current + 1;

        if (isFrameReady(next)) {
          frameRef.current = next;
          drawFrame(next);
        }

        if (next % 30 === 0) {
          const ahead = Math.min(
            next + HERO_FRAME_CONFIG.preloadBatchSize,
            total
          );
          preloadRange(next + 1, ahead - next, isMobileRef.current, total);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    function startPreloadAndPlay() {
      const mobile = isMobileRef.current;
      const total = getTotalFrames(mobile);
      const batchSize = HERO_FRAME_CONFIG.preloadBatchSize;

      preloadRange(1, batchSize, mobile, total);
      const firstFrame = preloadFrame(1, mobile);

      if (firstFrame.complete && firstFrame.naturalWidth > 0) {
        beginAnimation();
      } else {
        firstFrame.addEventListener('load', () => beginAnimation(), {
          once: true,
        });
        firstFrame.addEventListener('error', () => {
          setTimeout(() => beginAnimation(), 500);
        }, { once: true });
      }

      let batchStart = batchSize + 1;
      function preloadNextBatch() {
        if (batchStart > total) return;
        const end = Math.min(batchStart + batchSize - 1, total);
        preloadRange(batchStart, end - batchStart + 1, mobile, total);
        batchStart = end + 1;
        setTimeout(preloadNextBatch, 150);
      }
      setTimeout(preloadNextBatch, 200);
    }

    function handleBreakpointChange(e: MediaQueryListEvent) {
      const newMobile = e.matches;
      if (newMobile === isMobileRef.current) return;

      isMobileRef.current = newMobile;
      cacheRef.current.clear();

      const total = getTotalFrames(newMobile);
      const batchSize = HERO_FRAME_CONFIG.preloadBatchSize;

      cancelAnimationFrame(rafRef.current);
      playingRef.current = false;
      sizeRef.current = { cw: 1, ch: 1, dpr: 1 };

      preloadRange(1, batchSize, newMobile, total);
      const firstFrame = preloadFrame(1, newMobile);
      const restart = () => {
        frameRef.current = 1;
        let bs = batchSize + 1;
        function rest() {
          if (bs > total) return;
          const end = Math.min(bs + batchSize - 1, total);
          preloadRange(bs, end - bs + 1, isMobileRef.current, total);
          bs = end + 1;
          setTimeout(rest, 150);
        }
        setTimeout(rest, 200);
        beginAnimation();
      };

      if (firstFrame.complete && firstFrame.naturalWidth > 0) {
        restart();
      } else {
        firstFrame.addEventListener('load', () => restart(), { once: true });
      }
    }

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
        playingRef.current = false;
      } else if (!playingRef.current && loaderHiddenRef.current) {
        lastTickRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
        playingRef.current = true;
      }
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        syncCanvasSize();
        if (playingRef.current) drawFrame(frameRef.current);
      }, 150);
    }

    startPreloadAndPlay();

    mql.addEventListener('change', handleBreakpointChange);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      mql.removeEventListener('change', handleBreakpointChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#1a0a00]"
      style={{ height: '100svh', minHeight: '500px' }}
      aria-label="Mrittika brand story"
    >
      <div
        ref={loaderRef}
        className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#1a0a00]"
        style={{ transition: 'opacity 0.5s ease' }}
      >
        <div className="w-8 h-8 border-2 border-[#d4956a] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#d4956a] text-sm tracking-widest uppercase font-light mt-3">
          Loading...
        </p>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-6">
        <p className="tracking-[0.25em] uppercase font-light mb-3 text-[#f5dfc0] text-xs md:text-sm">
          Rooted in Nature · Refined by Ritual
        </p>

        <h1
          className="font-serif font-semibold leading-tight mb-4 drop-shadow-lg text-4xl md:text-5xl lg:text-6xl"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          From the Earth,
          <br />
          For Your Skin
        </h1>

        <p
          className="font-light text-[#f5dfc0] mb-8 max-w-md mx-auto leading-relaxed text-sm md:text-base"
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}
        >
          Handcrafted botanical rituals made for Indian skin
        </p>

        <div className="flex gap-3 flex-col sm:flex-row w-full max-w-xs sm:max-w-none">
          <Link
            href="/shop"
            className="bg-[#8B4513] hover:bg-[#7a3b10] text-white font-medium rounded-full transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl py-3 px-8 text-sm text-center"
          >
            Shop Now
          </Link>
          <Link
            href="/about"
            className="border border-white/70 hover:border-white text-white hover:bg-white/10 font-medium rounded-full transition-all duration-200 active:scale-95 py-3 px-8 text-sm text-center"
          >
            Our Story
          </Link>
        </div>
      </div>

      <div className="absolute z-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 bottom-8">
        <span className="text-white text-xs tracking-widest uppercase font-light">
          Discover
        </span>
        <div className="w-px h-8 bg-white/60 animate-pulse" />
      </div>
    </section>
  );
}
