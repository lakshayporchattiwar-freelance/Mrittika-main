"use client";

import { useState, useEffect, useCallback } from "react";
import { getReviews, submitReview, type Review } from "@/lib/reviews";
import styles from "./ReviewSection.module.css";

interface ReviewSectionProps {
  productSlug: string;
}

export default function ReviewSection({ productSlug }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const data = await getReviews(productSlug);
    setReviews(data);
    setLoading(false);
  }, [productSlug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === star).length /
              reviews.length) *
              100
          )
        : 0,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formRating === 0 || formComment.trim().length < 10)
      return;
    setSubmitting(true);
    const result = await submitReview(
      productSlug,
      formName.trim(),
      formRating,
      formComment.trim()
    );
    setSubmitting(false);
    if (result) {
      setFormName("");
      setFormRating(0);
      setFormComment("");
      setShowForm(false);
      setToast("Review submitted!");
      fetchReviews();
    }
  };

  const maskName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <span className={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={s <= rating ? styles.starFilled : styles.starEmpty}>
            ★
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className={styles.section}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <h3 className={styles.heading}>Customer Reviews</h3>

      <div className={styles.summary}>
        <div className={styles.avgBlock}>
          <span className={styles.avgNumber}>{avgRating.toFixed(1)}</span>
          {renderStars(Math.round(avgRating))}
          <span className={styles.reviewCount}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
        </div>
        <div className={styles.breakdown}>
          {ratingCounts.map(({ star, count, pct }) => (
            <div key={star} className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>{star}★</span>
              <div className={styles.breakdownBar}>
                <div className={styles.breakdownFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.breakdownCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        className={styles.writeBtn}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "Write a Review"}
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
                  className={
                    s <= (hoverRating || formRating)
                      ? styles.starFilled
                      : styles.starEmpty
                  }
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
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={
              submitting ||
              !formName.trim() ||
              formRating === 0 ||
              formComment.trim().length < 10
            }
          >
            {submitting ? "Submitting..." : "Post Review"}
          </button>
        </form>
      )}

      <div className={styles.reviewList}>
        {loading ? (
          <p className={styles.empty}>Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className={styles.empty}>No reviews yet. Be the first to share your experience!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                {renderStars(review.rating)}
                {review.verified && (
                  <span className={styles.verifiedBadge}>Verified Purchase</span>
                )}
              </div>
              <p className={styles.reviewComment}>{review.comment}</p>
              <div className={styles.reviewFooter}>
                <span className={styles.reviewName}>{maskName(review.name)}</span>
                <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
