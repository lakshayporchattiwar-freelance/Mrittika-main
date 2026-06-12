"use client";

import { useState, useEffect } from "react";
import styles from "./FloatingLeaves.module.css";

interface Leaf {
  id: number;
  x: number;
  duration: number;
  delay: number;
  sway: number;
  rotation: number;
  opacity: number;
  size: number;
  color: string;
}

const COLORS = [
  "var(--color-natural)",
  "var(--color-natural-light)",
  "var(--color-cta)",
  "var(--color-natural-dark)",
  "#b8a361",
];

function generateLeaves(count: number): Leaf[] {
  const arr: Leaf[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: i,
      x: Math.random() * 100,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      sway: 15 + Math.random() * 25,
      rotation: Math.random() * 360,
      opacity: 0.3 + Math.random() * 0.3,
      size: 16 + Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }
  return arr;
}

export default function FloatingLeaves({ count = 10 }: { count?: number }) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    setLeaves(generateLeaves(count));
  }, [count]);

  return (
    <div className={styles.container} aria-hidden="true">
      {leaves.map((leaf) => (
        <svg
          key={leaf.id}
          className={styles.leaf}
          style={{
            left: `${leaf.x}vw`,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            ["--sway" as string]: `${leaf.sway}px`,
            opacity: leaf.opacity,
            width: leaf.size,
            height: leaf.size,
          }}
          viewBox="0 0 24 24"
          fill={leaf.color}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3 11-8 0 0-1.5-.5-2-1z" />
        </svg>
      ))}
    </div>
  );
}
