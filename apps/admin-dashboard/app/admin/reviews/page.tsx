'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { Review } from '@/types';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id: string, action: 'accept' | 'reject') => {
    try {
      await api.patch(`/reviews/${id}/moderate`, { status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' });
      toast.success(`Review ${action}ed`);
      fetchReviews();
    } catch (error) {
      toast.error(`Failed to ${action} review`);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: 24, fontWeight: 700 }}>Review Moderation</h1>
        <div className="skeleton" style={{ height: 400 }}></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: 24, fontWeight: 700 }}>Review Moderation</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
        {reviews.length === 0 ? (
          <div style={{ padding: '48px 24px', color: 'var(--color-text-muted)' }}>
            No reviews pending moderation.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{review.patient_name}</div>
                  <div style={{ display: 'flex', gap: 2, color: 'var(--color-warning)', marginTop: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                {review.status === 'PENDING' ? (
                  <span className="badge badge-warning">Pending</span>
                ) : review.status === 'ACCEPTED' ? (
                  <span className="badge badge-success">Approved</span>
                ) : (
                  <span className="badge badge-error">Rejected</span>
                )}
              </div>
              
              <div style={{ flex: 1, color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 24, fontStyle: 'italic' }}>
                <MessageSquare size={16} style={{ marginBottom: 8, color: 'var(--color-text-muted)' }} />
                <br />
                "{review.content}"
              </div>

              {review.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => handleModerate(review.id, 'accept')} className="btn btn-primary" style={{ flex: 1 }}>
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button onClick={() => handleModerate(review.id, 'reject')} className="btn btn-danger" style={{ flex: 1 }}>
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
