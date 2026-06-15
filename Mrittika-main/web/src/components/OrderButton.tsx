'use client';

import { useState, useEffect } from 'react';
import styles from './OrderButton.module.css';

interface OrderButtonProps {
  defaultText: string;
  successText?: string;
  onClick?: () => void;
  disabled?: boolean;
  animate?: boolean;
  className?: string;
}

export default function OrderButton({
  defaultText,
  successText = 'Order Placed',
  onClick,
  disabled,
  animate: externalAnimate,
  className = '',
}: OrderButtonProps) {
  const [animating, setAnimating] = useState(false);

  function triggerAnimation() {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
    }, 8000);
  }

  useEffect(() => {
    if (externalAnimate && !animating) {
      triggerAnimation();
    }
  }, [externalAnimate]);

  function handleClick() {
    if (disabled || animating) return;
    onClick?.();
  }

  return (
    <button
      className={`${styles.order} ${animating ? styles.animate : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || animating}
      type="button"
    >
      <span className={styles.default}>{defaultText}</span>
      <span className={styles.success}>
        {successText}
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
        <div className={`${styles.light} ${styles.topLight}`} />
        <div className={`${styles.light} ${styles.bottomLight}`} />
      </div>
      <div className={styles.lines} />
    </button>
  );
}
