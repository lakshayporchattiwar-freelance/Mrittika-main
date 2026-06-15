'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export default function LiveProductRating({ slug, fallback }: { slug: string; fallback: number }) {
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`/api/reviews?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.average !== undefined) {
          setAverage(data.average);
          setCount(data.count || 0);
        }
      })
      .catch(() => {});
  }, [slug]);

  const display = average !== null ? average : fallback;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= Math.round(display) ? 'fill-[#8B4513] text-[#8B4513]' : 'fill-stone-200 text-stone-200'}`}
        />
      ))}
      <span style={{ marginLeft: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        {display.toFixed(1)}{count > 0 && ` (${count})`}
      </span>
    </span>
  );
}
