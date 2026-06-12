'use client';

import { useEffect, useRef } from 'react';
import { getFramePath } from '@/lib/heroFrameConfig';

export function useFramePreloader(
  currentFrame: number,
  totalFrames: number,
  isMobile: boolean,
  preloadAhead: number = 15
): void {
  const preloadedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const start = currentFrame + 1;
    const end = Math.min(currentFrame + preloadAhead, totalFrames);

    for (let i = start; i <= end; i++) {
      if (!preloadedRef.current.has(i)) {
        const img = new Image();
        img.src = getFramePath(i, isMobile);
        preloadedRef.current.add(i);
      }
    }
  }, [currentFrame, totalFrames, isMobile, preloadAhead]);
}
