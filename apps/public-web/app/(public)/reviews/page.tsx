import type { Metadata } from 'next';
import { Star, Quote } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Patient Reviews — Charming Dental Clinic',
  description: 'Read genuine reviews from our patients and see why hundreds of families trust Charming Dental Clinic for their smiles.',
};

interface Review {
  id: string;
  patient_name: string;
  content: string;
  rating?: number;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

async function getAllReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${API_URL}/reviews/public`, {
      next: { revalidate: 60 }, // ISR — revalidate every 60 seconds
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function StarRating({ rating }: { rating?: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={15}
          fill={i <= (rating ?? 0) ? 'currentColor' : 'none'}
          className={i <= (rating ?? 0) ? styles.starFilled : styles.starEmpty}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>Patient Testimonials</div>
          <h1 className={styles.title}>What Our Patients Say</h1>
          <p className={styles.subtitle}>
            Real experiences from real people. We're proud to share every kind word our patients have given us.
          </p>
          <div className={styles.summary}>
            <span className={styles.count}>{reviews.length}</span>
            <span className={styles.countLabel}>Verified Reviews</span>
          </div>
        </header>

        {reviews.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <p>No reviews yet. Be the first to share your experience!</p>
            <Link href="/book" className="btn btn-primary">Book an Appointment</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {reviews.map((review) => (
              <article key={review.id} className={styles.card}>
                <Quote size={22} className={styles.quoteIcon} />
                <p className={styles.content}>"{review.content}"</p>
                <footer className={styles.footer}>
                  <div className={styles.avatar}>
                    {review.patient_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.patientName}>{review.patient_name}</div>
                    <StarRating rating={review.rating} />
                    <div className={styles.date}>
                      {new Date(review.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </div>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
