'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, RefreshCw, Clock, Calendar, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

export default function RecycleBinPage() {
  const [deletedBookings, setDeletedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/deleted');
      setDeletedBookings(res.data);
    } catch (error) {
      toast.error('Failed to load deleted bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await api.patch(`/bookings/${id}/restore`);
      toast.success('Appointment restored successfully');
      fetchDeleted();
    } catch (error) {
      toast.error('Failed to restore appointment');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Link href="/admin/bookings" className="btn btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            Recycle Bin
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            View and restore deleted appointments to their previous state.
          </p>
        </div>
      </div>

      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading...
          </div>
        ) : deletedBookings.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>The recycle bin is empty.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9375rem' }}>
            <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Patient</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Appointment Date</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Deleted At</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedBookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                    {booking.patient_name}
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {booking.patient_phone}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Calendar size={14} color="var(--color-text-muted)" />
                      {format(new Date(booking.assigned_date || booking.preferred_date), 'MMM dd, yyyy')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      <Clock size={14} color="var(--color-text-muted)" />
                      {booking.assigned_session || booking.preferred_session}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>
                    {booking.deleted_at ? format(new Date(booking.deleted_at), 'MMM dd, yyyy hh:mm a') : 'Unknown'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleRestore(booking.id)} 
                      disabled={restoringId === booking.id}
                      className="btn btn-sm" 
                      style={{ color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid var(--color-primary)' }}
                    >
                      {restoringId === booking.id ? 'Restoring...' : <><RefreshCw size={14} /> Restore</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
