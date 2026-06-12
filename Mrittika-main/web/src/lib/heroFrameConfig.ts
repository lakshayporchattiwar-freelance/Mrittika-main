export const HERO_FRAME_CONFIG = {
  pcTotalFrames: 299,
  mobileTotalFrames: 300,
  fps: 30,
  pcFrameBasePath: '/hero/frames/webp_frame_',
  mobileFrameBasePath: '/hero/frames_mobile/webp_frame_',
  frameExtension: '.webp',
  preloadBatchSize: 30,
  mobileBreakpoint: 1024,
} as const;

export function getFramePath(index: number, isMobile: boolean): string {
  const base = isMobile
    ? HERO_FRAME_CONFIG.mobileFrameBasePath
    : HERO_FRAME_CONFIG.pcFrameBasePath;
  const paddedIndex = String(index).padStart(4, '0');
  return `${base}${paddedIndex}${HERO_FRAME_CONFIG.frameExtension}`;
}

export function getTotalFrames(isMobile: boolean): number {
  return isMobile
    ? HERO_FRAME_CONFIG.mobileTotalFrames
    : HERO_FRAME_CONFIG.pcTotalFrames;
}

export function getFrameInterval(): number {
  return 1000 / HERO_FRAME_CONFIG.fps;
}
