'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AboutTimeline.module.css';

const TIMELINE_ENTRIES = [
  { year: 'Feb 2026', text: 'Personal Skin concern led to research and prototype development' },
  { year: 'March 2026', text: 'Launched first 100 testers and validated the product' },
  { year: 'June 2026', text: '500+ Rituals delivered across India' },
];

export default function AboutTimeline() {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>([false, false, false]);
  const [lineVisible, setLineVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const setItemRef = useCallback((el: HTMLDivElement | null, index: number) => {
    itemRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    if (sectionRef.current) {
      const lineObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setLineVisible(true);
          }
        },
        { threshold: 0.1 }
      );
      lineObserver.observe(sectionRef.current);
      observers.push(lineObserver);
    }

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return (
    <div className={styles.timeline} ref={sectionRef}>
      <div className={`${styles.timelineLine} ${lineVisible ? styles.timelineLineVisible : ''}`} />
      {TIMELINE_ENTRIES.map((item, index) => (
        <div
          key={item.year}
          ref={(el) => setItemRef(el, index)}
          className={`${styles.timelineItem} ${visibleItems[index] ? styles.timelineItemVisible : ''}`}
          style={{ transitionDelay: `${index * 180}ms` }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className={`${styles.timelineDot} ${visibleItems[index] ? styles.timelineDotVisible : ''} ${hoveredIndex === index ? styles.timelineDotHover : ''}`}
            style={{ transitionDelay: `${index * 180 + 100}ms` }}
          />
          <div className={styles.timelineContent}>
            <span
              className={`${styles.timelineYear} ${hoveredIndex === index ? styles.timelineYearHover : ''}`}
            >
              {item.year}
            </span>
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
