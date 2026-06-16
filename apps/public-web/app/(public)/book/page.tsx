'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { User, Mail, Phone, Calendar, Clock, ArrowRight } from 'lucide-react';
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
          {/* Left: Info */}
          <div className={styles.info}>
            <div className={`badge badge-primary ${styles.badge}`}>
              <Clock size={12} /> Quick & Easy
            </div>
            <h1 className={styles.title}>Book Your Appointment</h1>
            <p className={styles.subtitle}>
              Fill in the form and we'll send a verification code to your phone to confirm your booking.
            </p>

            <div className={styles.steps}>
              {[
                { n: '1', label: 'Fill the form' },
                { n: '2', label: 'Verify your phone with OTP' },
                { n: '3', label: 'Clinic confirms your slot' },
              ].map((step) => (
                <div key={step.n} className={styles.step}>
                  <div className={styles.stepNum}>{step.n}</div>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.sessions}>
              <div className={`${styles.session} ${styles.morning}`}>
                <span className={styles.sessionEmoji}>🌅</span>
                <div>
                  <div className={styles.sessionName}>Morning Session</div>
                  <div className={styles.sessionTime}>9:00 AM – 1:00 PM</div>
                </div>
              </div>
              <div className={`${styles.session} ${styles.evening}`}>
                <span className={styles.sessionEmoji}>🌆</span>
                <div>
                  <div className={styles.sessionName}>Evening Session</div>
                  <div className={styles.sessionTime}>5:00 PM – 9:00 PM</div>
                </div>
              </div>
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
                    <span>🌅</span>
                    <div>
                      <div className={styles.sessionOptionName}>Morning</div>
                      <div className={styles.sessionOptionTime}>9 AM – 1 PM</div>
                    </div>
                  </label>
                  <label
                    className={`${styles.sessionOption} ${selectedSession === 'EVENING' ? styles.sessionSelected : ''}`}
                  >
                    <input type="radio" value="EVENING" className={styles.hiddenRadio} {...register('preferred_session')} />
                    <span>🌆</span>
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
