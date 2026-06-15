'use client';

import { useState, useEffect } from 'react';
import styles from './ProductReviews.module.css';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
}

export function ProductReviews({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?slug=${productSlug}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverage(data.average || 0);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [productSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');

    if (!formName.trim()) {
      setSubmitError('Please enter your name.');
      return;
    }
    if (formRating === 0) {
      setSubmitError('Please select a rating.');
      return;
    }
    if (formComment.trim().length < 10) {
      setSubmitError('Review must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug,
          customerName: formName.trim(),
          rating: formRating,
          comment: formComment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit review.');
        return;
      }

      setSubmitSuccess(true);
      setFormName('');
      setFormRating(0);
      setFormComment('');
      setShowForm(false);
      await loadReviews();

      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent: reviews.length > 0
      ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  function renderStars(rating: number, size: string = styles.starMd) {
    return (
      <span className={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={`${s <= rating ? styles.starFilled : styles.starEmpty} ${size}`}>★</span>
        ))}
      </span>
    );
  }

  function maskName(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className={styles.section}>
        <h3 className={styles.heading}>Customer Reviews</h3>
        <div className={styles.empty}>Loading reviews…</div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      {submitSuccess && (
        <div className={styles.toast}>Review submitted!</div>
      )}

      <h3 className={styles.heading}>Customer Reviews</h3>

      {reviews.length === 0 ? (
        <p className={styles.emptyText}>No reviews yet. Be the first to share your experience!</p>
      ) : (
        <div className={styles.summary}>
          <div className={styles.avgBlock}>
            <span className={styles.avgNumber}>{average.toFixed(1)}</span>
            {renderStars(Math.round(average))}
            <span className={styles.reviewCount}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
          <div className={styles.breakdown}>
            {ratingCounts.map(({ star, count, percent }) => (
              <div key={star} className={styles.breakdownRow}>
                <span className={styles.breakdownLabel}>{star}★</span>
                <div className={styles.breakdownBar}>
                  <div className={styles.breakdownFill} style={{ width: `${percent}%` }} />
                </div>
                <span className={styles.breakdownCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className={styles.writeBtn}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Write a Review'}
      </button>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Name
            <input
              type="text"
              className={styles.input}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              placeholder="Your name"
            />
          </label>
          <label className={styles.label}>
            Rating
            <div className={styles.starInput}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  className={s <= (hoverRating || formRating) ? styles.starFilled : styles.starEmpty}
                  onClick={() => setFormRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
          </label>
          <label className={styles.label}>
            Your Review
            <textarea
              className={styles.textarea}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              required
              minLength={10}
              placeholder="Share your experience (min 10 characters)"
              rows={4}
            />
          </label>
          {submitError && <p className={styles.error}>{submitError}</p>}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || !formName.trim() || formRating === 0 || formComment.trim().length < 10}
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      )}

      <div className={styles.reviewList}>
        {reviews.length === 0 && !loading ? null : reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              {renderStars(review.rating, styles.starSm)}
              {review.is_verified && (
                <span className={styles.verifiedBadge}>Verified Purchase</span>
              )}
            </div>
            <p className={styles.reviewComment}>{review.comment}</p>
            <div className={styles.reviewFooter}>
              <span className={styles.reviewName}>{maskName(review.customer_name)}</span>
              <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
