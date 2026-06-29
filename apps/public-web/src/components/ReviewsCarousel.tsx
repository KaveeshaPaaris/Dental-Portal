'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, Quote, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VIEWPORT_CONFIG, staggerContainer, DURATIONS, EASE_OUT } from '@/utils/animations';
import { FadeUp } from '@/components/animations';
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

const MotionStar = motion.create(Star);

function StarRating({ rating }: { rating?: number }) {
  return (
    <motion.div 
      className={styles.stars}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <MotionStar
          key={i}
          size={16}
          variants={{
             hidden: { scale: 0, opacity: 0 },
             visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 15 } }
          }}
          className={i <= (rating ?? 0) ? styles.starFilled : styles.starEmpty}
          fill={i <= (rating ?? 0) ? 'currentColor' : 'none'}
        />
      ))}
    </motion.div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 280;
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
        <div className={styles.flagIcon}>
          <img src="https://flagcdn.com/w40/lk.png" alt="Sri Lanka" width="32" />
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
        <FadeUp>
          <div className={styles.header}>
            <h2 className={styles.title}>See What Our Patients Say</h2>
            <p className={styles.subtitle}>Real experiences from real patients who trust us with their smiles.</p>
          </div>
        </FadeUp>

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

          <motion.div className={styles.cardsGrid} layout>
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleReviews.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ duration: DURATIONS.fast, ease: EASE_OUT }}
                  whileHover={{ y: -8, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
                  style={{ width: '100%' }} // Ensure it flexes correctly
                >
                  <ReviewCard review={review} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

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
