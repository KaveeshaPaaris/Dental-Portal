'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { User, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

const schema = z.object({
  patient_name: z.string().min(2, 'Name must be at least 2 characters'),
  patient_email: z.string().email('Invalid email').optional().or(z.literal('')),
  patient_phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must start with + and country code (e.g. +94771234567)'),
  preferred_date: z.string().min(1, 'Please select a date'),
  preferred_session: z.enum(['MORNING', 'EVENING']).refine((v) => v !== undefined, { message: 'Please select a session' }),
});

type FormData = z.infer<typeof schema>;

export default function BookAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register, handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedSession = watch('preferred_session');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<{ booking_id: string }>('/bookings', data);
      toast.success('OTP sent! Please verify your phone number.');
      // Pass booking_id + phone to OTP page via URL
      router.push(
        `/book/verify?id=${res.data.booking_id}&phone=${encodeURIComponent(data.patient_phone)}`
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to submit booking. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* Left: Photo Card */}
          <div className={styles.photoCard}>
            <img
              src="/clinic-interior.png"
              alt="Dental Clinic Interior"
              className={styles.clinicImage}
            />
            <div className={styles.photoOverlay}>
              <h1 className={styles.photoTitle}>Book Your<br />Appointment</h1>
              <p className={styles.photoSubtitle}>
                Fill in the form and we'll send a verification code to your phone to confirm your booking.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className={`card ${styles.formCard}`}>
            <h2 className={styles.formTitle}>Appointment Details</h2>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="patient_name">Full Name *</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    id="patient_name"
                    className={`form-input ${styles.inputWithIcon}`}
                    placeholder="John Smith"
                    {...register('patient_name')}
                  />
                </div>
                {errors.patient_name && <span className="form-error">{errors.patient_name.message}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="patient_email">Email Address (optional)</label>
                <div className={styles.inputWrap}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input
                    id="patient_email"
                    type="email"
                    className={`form-input ${styles.inputWithIcon}`}
                    placeholder="john@example.com"
                    {...register('patient_email')}
                  />
                </div>
                {errors.patient_email && <span className="form-error">{errors.patient_email.message}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="patient_phone">
                  Phone Number * <span className={styles.hint}>(include country code, e.g. +1)</span>
                </label>
                <div className={styles.inputWrap}>
                  <Phone size={16} className={styles.inputIcon} />
                  <input
                    id="patient_phone"
                    type="tel"
                    className={`form-input ${styles.inputWithIcon}`}
                    placeholder="+1 555 000 0000"
                    {...register('patient_phone')}
                  />
                </div>
                {errors.patient_phone && <span className="form-error">{errors.patient_phone.message}</span>}
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="preferred_date">Preferred Date *</label>
                <div className={styles.inputWrap}>
                  <Calendar size={16} className={styles.inputIcon} />
                  <input
                    id="preferred_date"
                    type="date"
                    min={minDate}
                    className={`form-input ${styles.inputWithIcon}`}
                    {...register('preferred_date')}
                  />
                </div>
                {errors.preferred_date && <span className="form-error">{errors.preferred_date.message}</span>}
              </div>

              {/* Session */}
              <div className="form-group">
                <label className="form-label">Preferred Session *</label>
                <div className={styles.sessionPicker}>
                  <label
                    className={`${styles.sessionOption} ${selectedSession === 'MORNING' ? styles.sessionSelected : ''}`}
                  >
                    <input type="radio" value="MORNING" className={styles.hiddenRadio} {...register('preferred_session')} />
                    <span className={styles.sessionIcon}>
                      {/* Sun SVG */}
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="14" cy="14" r="5.5" fill="#F5A25D" stroke="#E8884A" strokeWidth="1"/>
                        {/* rays */}
                        <line x1="14" y1="1.5" x2="14" y2="4.5" stroke="#E8884A" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="14" y1="23.5" x2="14" y2="26.5" stroke="#E8884A" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="1.5" y1="14" x2="4.5" y2="14" stroke="#E8884A" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="23.5" y1="14" x2="26.5" y2="14" stroke="#E8884A" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="5.05" y1="5.05" x2="7.17" y2="7.17" stroke="#E8884A" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="20.83" y1="20.83" x2="22.95" y2="22.95" stroke="#E8884A" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="22.95" y1="5.05" x2="20.83" y2="7.17" stroke="#E8884A" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="7.17" y1="20.83" x2="5.05" y2="22.95" stroke="#E8884A" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <div>
                      <div className={styles.sessionOptionName}>Morning</div>
                      <div className={styles.sessionOptionTime}>9 AM – 1 PM</div>
                    </div>
                  </label>
                  <label
                    className={`${styles.sessionOption} ${selectedSession === 'EVENING' ? styles.sessionSelected : ''}`}
                  >
                    <input type="radio" value="EVENING" className={styles.hiddenRadio} {...register('preferred_session')} />
                    <span className={styles.sessionIcon}>
                      {/* Crescent Moon with Sparkle Stars SVG */}
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Crescent moon: big circle minus smaller offset circle */}
                        <path d="M15 3C9.477 3 5 7.477 5 13C5 18.523 9.477 23 15 23C18.4 23 21.38 21.27 23.13 18.63C22.12 18.87 21.07 19 20 19C13.925 19 9 14.075 9 8C9 6.4 9.35 4.88 9.98 3.52C8.4 3.18 7 3 15 3Z" fill="#E8D89A"/>

                        {/* Large 4-pointed sparkle star (top right area) */}
                        <path d="M24 6 L24.6 8.4 L27 9 L24.6 9.6 L24 12 L23.4 9.6 L21 9 L23.4 8.4 Z" fill="#E8D89A"/>

                        {/* Small 4-pointed sparkle star (middle right) */}
                        <path d="M27 16 L27.4 17.6 L29 18 L27.4 18.4 L27 20 L26.6 18.4 L25 18 L26.6 17.6 Z" fill="#E8D89A"/>

                        {/* Large dot */}
                        <circle cx="22" cy="14" r="1.3" fill="#E8D89A"/>

                        {/* Small dot */}
                        <circle cx="25" cy="11" r="0.8" fill="#E8D89A"/>
                      </svg>
                    </span>
                    <div>
                      <div className={styles.sessionOptionName}>Evening</div>
                      <div className={styles.sessionOptionTime}>5 PM – 9 PM</div>
                    </div>
                  </label>
                </div>
                {errors.preferred_session && <span className="form-error">{errors.preferred_session.message}</span>}
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn} ${loading ? 'btn-loading' : ''}`}
                disabled={loading}
              >
                {loading ? '' : (
                  <><span>Send OTP & Continue</span><ArrowRight size={18} /></>
                )}
              </button>

              <p className={styles.privacy}>
                🔒 Your information is kept private and only shared with clinic staff.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
