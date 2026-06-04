'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return <span className="badge badge-warning">Pending Review</span>;
      case 'ACCEPTED': return <span className="badge badge-success">Accepted</span>;
      case 'REJECTED': return <span className="badge badge-error">Rejected</span>;
      case 'COMPLETED': return <span className="badge badge-info">Completed</span>;
      case 'CANCELLED': return <span className="badge badge-error">Cancelled</span>;
      case 'PENDING_OTP': return <span className="badge" style={{ background: 'var(--color-surface-2)' }}>Awaiting OTP</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handleStatusChange = async (id: string, action: 'accept' | 'reject') => {
    try {
      await api.patch(`/bookings/${id}/${action}`);
      toast.success(`Booking ${action}ed successfully`);
      fetchBookings();
    } catch (error) {
      toast.error(`Failed to ${action} booking`);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: 24, fontWeight: 700 }}>Bookings Queue</h1>
        <div className="skeleton" style={{ height: 400 }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Bookings Queue</h1>
        <Link href="/admin/bookings/schedule" className="btn btn-primary">
          <Calendar size={18} /> Schedule Board
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Patient</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Contact</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Requested Date</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No bookings found in the queue.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                    {booking.patient_name}
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Source: {booking.source}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>
                    {booking.patient_phone}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Calendar size={14} color="var(--color-text-muted)" />
                      {format(new Date(booking.preferred_date), 'MMM dd, yyyy')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      <Clock size={14} color="var(--color-text-muted)" />
                      {booking.preferred_session}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {getStatusBadge(booking.status)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      {booking.status === 'PENDING_REVIEW' && (
                        <>
                          <button onClick={() => handleStatusChange(booking.id, 'accept')} className="btn btn-sm" style={{ color: 'var(--color-success)', background: 'rgba(34,197,94,0.1)' }} title="Accept">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleStatusChange(booking.id, 'reject')} className="btn btn-sm" style={{ color: 'var(--color-error)', background: 'rgba(239,68,68,0.1)' }} title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <Link href={`/admin/bookings/${booking.id}`} className="btn btn-secondary btn-sm" title="View Details">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
