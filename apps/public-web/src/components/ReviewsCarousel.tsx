'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, Quote, ArrowRight } from 'lucide-react';
import styles from './ReviewsCarousel.module.css';

interface Review {
  id: string;
  patient_name: string;
  content: string;
  rating?: number;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
const SLIDE_INTERVAL = 5000;

function StarRating({ rating }: { rating?: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= (rating ?? 0) ? styles.starFilled : styles.starEmpty}
          fill={i <= (rating ?? 0) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 140;
  const isLong = review.content.length > MAX_LENGTH;
  const displayText = expanded || !isLong ? review.content : review.content.slice(0, MAX_LENGTH) + '…';

  return (
    <div className={styles.card}>
      <Quote size={24} className={styles.quoteIcon} />
      <p className={styles.cardText}>{displayText}</p>
      {isLong && (
        <button className={styles.readMore} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
      <div className={styles.cardFooter}>
        <div className={styles.avatar}>
          {review.patient_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className={styles.patientName}>{review.patient_name}</div>
          <StarRating rating={review.rating} />
        </div>
      </div>
    </div>
  );
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/reviews/featured`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSlides = reviews.length;
  const visibleCount = Math.min(3, totalSlides);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % totalSlides);
  }, [totalSlides]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-advance
  useEffect(() => {
    if (paused || totalSlides <= 3) return;
    timerRef.current = setTimeout(next, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, next, totalSlides]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className="container">
          <div className={styles.header}>
            <h2 className={styles.title}>See What Our Patients Say</h2>
          </div>
          <div className={styles.skeletonGrid}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  // Build the visible slice (wrapping)
  const visibleReviews = Array.from({ length: visibleCount }, (_, i) => reviews[(current + i) % totalSlides]);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>See What Our Patients Say</h2>
          <p className={styles.subtitle}>Real experiences from real patients who trust us with their smiles.</p>
        </div>

        <div
          className={styles.carouselWrapper}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {totalSlides > 3 && (
            <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={prev} aria-label="Previous reviews">
              <ChevronLeft size={20} />
            </button>
          )}

          <div className={styles.cardsGrid}>
            {visibleReviews.map((review, i) => (
              <ReviewCard key={`${review.id}-${i}`} review={review} />
            ))}
          </div>

          {totalSlides > 3 && (
            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={next} aria-label="Next reviews">
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {totalSlides > 3 && (
          <div className={styles.dots}>
            {reviews.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className={styles.cta}>
          <Link href="/reviews" className="btn btn-secondary btn-lg">
            View All Reviews <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
