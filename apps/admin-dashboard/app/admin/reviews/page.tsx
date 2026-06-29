'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, MessageSquare, Lock, Sparkles, EyeOff, Eye } from 'lucide-react';
import api from '@/lib/api';
import { Review } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuringId, setFeaturingId] = useState<string | null>(null);
  const [hidingId, setHidingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data);
    } catch {
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
      await api.patch(`/reviews/${id}/${action}`);
      toast.success(`Review ${action === 'accept' ? 'approved' : 'rejected'}`);
      fetchReviews();
    } catch {
      toast.error(`Failed to ${action} review`);
    }
  };

  const handleFeature = async (review: Review) => {
    const newValue = !review.is_featured;
    setFeaturingId(review.id);
    try {
      await api.patch(`/reviews/${review.id}/feature`, { featured: newValue });
      toast.success(newValue ? '⭐ Review featured on homepage!' : 'Review removed from homepage');
      fetchReviews();
    } catch {
      toast.error('Failed to update feature status');
    } finally {
      setFeaturingId(null);
    }
  };

  const handleHide = async (review: Review) => {
    const newValue = !review.is_hidden;
    setHidingId(review.id);
    try {
      await api.patch(`/reviews/${review.id}/hide`, { hidden: newValue });
      toast.success(newValue ? 'Review hidden from public view' : 'Review is now visible to the public');
      fetchReviews();
    } catch {
      toast.error('Failed to update review visibility');
    } finally {
      setHidingId(null);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Review Moderation</h1>
        {!isSuperAdmin && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--color-warning-light, #fef3c7)',
            border: '1px solid var(--color-warning, #f59e0b)',
            borderRadius: 'var(--radius-md)', padding: '8px 16px',
            color: 'var(--color-warning-dark, #92400e)', fontSize: '0.875rem',
          }}>
            <Lock size={14} />
            Read-only — Only super admins can approve, reject or feature reviews
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div style={{ padding: '48px 24px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          No reviews yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
          {reviews.map((review) => (
            <div key={review.id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

              {/* Hidden ribbon */}
              {review.is_hidden && (
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  background: 'linear-gradient(135deg, #64748b, #475569)',
                  color: 'white', fontSize: '0.6875rem', fontWeight: 700,
                  padding: '4px 12px', borderBottomRightRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <EyeOff size={10} /> HIDDEN
                </div>
              )}

              {/* Featured ribbon */}
              {review.is_featured && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white', fontSize: '0.6875rem', fontWeight: 700,
                  padding: '4px 12px', borderBottomLeftRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Sparkles size={10} /> FEATURED
                </div>
              )}

              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{review.patient_name}</div>
                  <div style={{ display: 'flex', gap: 2, color: 'var(--color-warning)', marginTop: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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

              {/* Review content */}
              <div style={{ flex: 1, color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 16, fontStyle: 'italic', lineHeight: 1.6 }}>
                <MessageSquare size={16} style={{ marginBottom: 8, color: 'var(--color-text-muted)', display: 'block' }} />
                "{review.content}"
              </div>

              {/* Super admin actions only */}
              {isSuperAdmin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Approve / Reject (only for PENDING) */}
                  {review.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleModerate(review.id, 'accept')}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleModerate(review.id, 'reject')}
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}

                  {/* Feature toggle (only for ACCEPTED reviews) */}
                  {review.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleFeature(review)}
                      disabled={featuringId === review.id}
                      className={review.is_featured ? 'btn btn-warning' : 'btn btn-secondary'}
                      style={{ width: '100%' }}
                    >
                      <Sparkles size={16} />
                      {featuringId === review.id
                        ? 'Updating...'
                        : review.is_featured
                          ? 'Remove from Homepage'
                          : 'Feature on Homepage'}
                    </button>
                  )}

                  {/* Hide / Show toggle (for any accepted review) */}
                  {review.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleHide(review)}
                      disabled={hidingId === review.id}
                      className={review.is_hidden ? 'btn btn-secondary' : 'btn btn-danger'}
                      style={{ width: '100%', opacity: review.is_hidden ? 1 : 0.85 }}
                    >
                      {review.is_hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                      {hidingId === review.id
                        ? 'Updating...'
                        : review.is_hidden
                          ? 'Show to Public'
                          : 'Hide from Public'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
