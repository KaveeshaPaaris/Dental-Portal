'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { X, User, Mail, Phone, Calendar, ArrowRight, SunMedium, Moon, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const schema = z.object({
  patient_name: z.string().min(2, 'Name must be at least 2 characters'),
  patient_email: z.string().email('Invalid email').optional().or(z.literal('')),
  patient_phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must start with + and country code (e.g. +94771234567)'),
  preferred_date: z.string().min(1, 'Please select a date'),
  preferred_session: z.enum(['MORNING', 'EVENING']).refine((v) => v !== undefined, { message: 'Please select a session' }),
});

type FormData = z.infer<typeof schema>;

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminBookingModal({ isOpen, onClose }: AdminBookingModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register, handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedSession = watch('preferred_session');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // 1. Create booking (bypasses OTP, creates as PENDING_REVIEW)
      const createRes = await api.post('/bookings/admin', {
        ...data,
        source: 'PHONE', // Admin-created bookings default to PHONE
        notes: 'Created manually via Admin Portal',
      });
      
      const bookingId = createRes.data.id;

      // 2. Immediately accept the booking to place it in the Schedule Board
      try {
        await api.patch(`/bookings/${bookingId}/accept`, {
          assigned_date: data.preferred_date,
          assigned_session: data.preferred_session,
        });
        toast.success('Appointment booked successfully!');
        
        // Dispatch event to refresh schedule/bookings pages
        window.dispatchEvent(new Event('booking-created'));
        reset();
        onClose();
      } catch (acceptErr: any) {
        // If acceptance fails (e.g., slot issues if implemented later), it stays in pending queue
        toast.success('Booking created, but sent to Pending Queue.');
        window.dispatchEvent(new Event('booking-created'));
        reset();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Failed to submit booking. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%', maxWidth: 500, padding: 32,
          boxShadow: 'var(--shadow-xl)', overflowY: 'auto', maxHeight: '90vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Book Appointment</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
              Manually schedule a patient appointment.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="patient_name">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="patient_name"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="John Smith"
                {...register('patient_name')}
              />
            </div>
            {errors.patient_name && <span className="form-error">{errors.patient_name.message}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="patient_email">Email Address (optional)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="patient_email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="john@example.com"
                {...register('patient_email')}
              />
            </div>
            {errors.patient_email && <span className="form-error">{errors.patient_email.message}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label" htmlFor="patient_phone">
              Phone Number * <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>(include country code, e.g. +1)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="patient_phone"
                type="tel"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="+1 555 000 0000"
                {...register('patient_phone')}
              />
            </div>
            {errors.patient_phone && <span className="form-error">{errors.patient_phone.message}</span>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="preferred_date">Preferred Date *</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                id="preferred_date"
                type="date"
                min={minDate}
                className="form-input"
                style={{ paddingLeft: 40 }}
                {...register('preferred_date')}
              />
            </div>
            {errors.preferred_date && <span className="form-error">{errors.preferred_date.message}</span>}
          </div>

          {/* Session */}
          <div className="form-group">
            <label className="form-label">Preferred Session *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label
                style={{
                  border: `2px solid ${selectedSession === 'MORNING' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selectedSession === 'MORNING' ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)', padding: '16px 12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input type="radio" value="MORNING" style={{ display: 'none' }} {...register('preferred_session')} />
                <SunMedium size={28} color={selectedSession === 'MORNING' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, color: selectedSession === 'MORNING' ? 'var(--color-primary)' : 'var(--color-text-primary)', fontSize: '0.9375rem' }}>Morning</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>9 AM – 1 PM</div>
                </div>
              </label>
              <label
                style={{
                  border: `2px solid ${selectedSession === 'EVENING' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selectedSession === 'EVENING' ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)', padding: '16px 12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input type="radio" value="EVENING" style={{ display: 'none' }} {...register('preferred_session')} />
                <Moon size={28} color={selectedSession === 'EVENING' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, color: selectedSession === 'EVENING' ? 'var(--color-primary)' : 'var(--color-text-primary)', fontSize: '0.9375rem' }}>Evening</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>5 PM – 9 PM</div>
                </div>
              </label>
            </div>
            {errors.preferred_session && <span className="form-error">{errors.preferred_session.message}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: 48, fontSize: '1rem', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <Loader2 className="spin" size={20} /> : (
              <><span>Create Appointment</span><ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
