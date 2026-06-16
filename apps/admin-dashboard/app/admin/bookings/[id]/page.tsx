'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, User, Phone, Save } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

export default function SingleBookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [assignedSession, setAssignedSession] = useState('');

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await api.get(`/bookings/${id}`);
        const data = res.data;
        setBooking(data);
        setNotes(data.notes || '');
        setStatus(data.status);
        setAssignedSession(data.assigned_session || data.preferred_session);
      } catch (error) {
        toast.error('Booking not found');
        router.push('/admin/bookings');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBooking();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/bookings/${id}/status`, {
        status,
        notes,
        assigned_session: assignedSession
      });
      toast.success('Booking updated successfully');
      router.push('/admin/bookings');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 600 }}></div>;
  }

  if (!booking) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/admin/bookings" className="btn btn-secondary btn-sm" style={{ padding: 8 }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Booking Details</h1>
        <div style={{ marginLeft: 'auto' }}>
          <span className="badge badge-primary">ID: {booking.id.split('-')[0]}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Patient Info Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={20} color="var(--color-primary)" /> Patient Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Full Name</label>
                <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{booking.patient_name}</div>
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                  <Phone size={14} color="var(--color-text-muted)" /> {booking.patient_phone}
                </div>
              </div>
              <div>
                <label className="form-label">Source</label>
                <div>{booking.source}</div>
              </div>
              <div>
                <label className="form-label">OTP Verified</label>
                <div>{booking.otp_verified ? <span className="badge badge-success">Yes</span> : <span className="badge badge-warning">No</span>}</div>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Clinical Notes</h2>
            <textarea 
              className="form-input" 
              rows={6} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about the patient or appointment here..."
            />
          </div>
        </div>

        {/* Action Panel */}
        <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: 90 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 24 }}>Appointment Status</h2>
          
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Assigned Session</label>
            <select className="form-input" value={assignedSession} onChange={(e) => setAssignedSession(e.target.value)}>
              <option value="MORNING">Morning (08:00 - 13:00)</option>
              <option value="EVENING">Evening (14:00 - 20:00)</option>
            </select>
          </div>

          <div style={{ marginBottom: 32, padding: 16, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
            <label className="form-label">Requested Date</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--color-primary)', marginTop: 4 }}>
              <Calendar size={16} />
              {format(new Date(booking.preferred_date), 'MMMM d, yyyy')}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} style={{ width: '100%' }}>
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
