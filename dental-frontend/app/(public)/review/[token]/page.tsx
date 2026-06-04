'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import styles from './page.module.css';

export default function ReviewSubmissionPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [patientName, setPatientName] = useState('');
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await api.get(`/reviews/submit/${token}`);
        setPatientName(res.data.patientName);
        setValidToken(true);
      } catch (err: any) {
        setValidToken(false);
        setError(err.response?.data?.error || 'Invalid or expired review link.');
      } finally {
        setLoading(false);
      }
    }
    if (token) validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!content.trim()) {
      setError('Please write a brief review.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/reviews/submit/${token}`, { rating, content });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Verifying review link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorIcon} style={{ margin: '0 auto 24px' }}>
            <XCircle size={32} />
          </div>
          <h1 className={styles.title}>Link Invalid</h1>
          <p className={styles.subtitle}>{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successWrapper}>
            <div className={styles.successIcon}>
              <CheckCircle size={32} />
            </div>
            <h1 className={styles.title}>Thank You!</h1>
            <p className={styles.subtitle}>
              Your feedback helps us provide better care for everyone. We truly appreciate you taking the time to review your experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>How was your visit?</h1>
          <p className={styles.subtitle}>
            Hi {patientName}, please rate your recent experience at Smile Dental Clinic.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.starRating} onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.starBtn} ${(hoverRating || rating) >= star ? styles.starFilled : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => setRating(star)}
              >
                <Star fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} size={40} strokeWidth={1.5} />
              </button>
            ))}
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: 24 }}>
            <label className="form-label" htmlFor="content">Your Review</label>
            <textarea
              id="content"
              className="form-input"
              rows={4}
              placeholder="Tell us what you liked or how we can improve..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button 
            type="submit" 
            className={`btn btn-primary btn-xl ${styles.submitBtn} ${submitting ? 'btn-loading' : ''}`}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
