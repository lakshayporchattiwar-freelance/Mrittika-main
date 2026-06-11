"use client";

import { useEffect, useRef } from "react";
import styles from "./TruckAnimation.module.css";

type TruckAnimationProps = {
  onComplete?: () => void;
  autoPlay?: boolean;
};

export default function TruckAnimation({ onComplete, autoPlay }: TruckAnimationProps) {
  const calledRef = useRef(false);

  useEffect(() => {
    if (!autoPlay || calledRef.current) return;
    calledRef.current = true;
    const timer = window.setTimeout(() => {
      onComplete?.();
    }, 10000);
    return () => clearTimeout(timer);
  }, [autoPlay, onComplete]);

  return (
    <div className={`${styles.order} ${autoPlay ? styles.animate : ""}`}>
      <span className={styles.default}>Complete Order</span>
      <span className={styles.success}>
        Order Placed
        <svg viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1" />
        </svg>
      </span>
      <div className={styles.box} />
      <div className={styles.truck}>
        <div className={styles.back} />
        <div className={styles.front}>
          <div className={styles.window} />
        </div>
        <div className={`${styles.light} ${styles.lightTop}`} />
        <div className={`${styles.light} ${styles.lightBottom}`} />
      </div>
      <div className={styles.lines} />
    </div>
  );
}
