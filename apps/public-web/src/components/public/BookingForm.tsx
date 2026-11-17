'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { User, Mail, Calendar, ArrowRight } from 'lucide-react';
import styles from '../../../app/(public)/book/page.module.css';

import { isValidPhoneNumber } from 'react-phone-number-input';

// Lazy load the PhoneInput since it's a heavy dependency
const PhoneInput = dynamic(() => import('@/components/PhoneInput'), {
  ssr: false,
  loading: () => <div className="h-[47px] animate-pulse bg-slate-100 rounded-md w-full" aria-hidden="true" />
});

const schema = z.object({
  patient_name: z.string().min(2, 'Name must be at least 2 characters'),
  patient_email: z.string().email('Invalid email').optional().or(z.literal('')),
  patient_phone: z.string()
    .min(1, 'Phone number is required')
    .refine((val) => val && isValidPhoneNumber(val), 'Invalid phone number for the selected country'),
  preferred_date: z.string().min(1, 'Please select a date'),
  preferred_session: z.enum(['MORNING', 'EVENING']).refine((v) => v !== undefined, { message: 'Please select a session' }),
});

type FormData = z.infer<typeof schema>;

interface ScheduleOverride {
  morning_enabled: boolean;
  evening_enabled: boolean;
  custom_session_enabled: boolean;
  custom_session_label: string | null;
  custom_session_start: string | null;
  custom_session_end: string | null;
}

export default function BookingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [override, setOverride] = useState<ScheduleOverride | null>(null);
  const [isCheckingDate, setIsCheckingDate] = useState(false);

  const {
    register, handleSubmit, control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedSession = watch('preferred_session');
  const selectedDate = watch('preferred_date');

  useEffect(() => {
    if (!selectedDate) {
      setOverride(null);
      return;
    }
    
    let isMounted = true;
    const fetchOverride = async () => {
      setIsCheckingDate(true);
      try {
        const res = await api.get(`/schedule/overrides/${selectedDate}`);
        if (isMounted) {
          if (res.data && 'morning_enabled' in res.data) {
            setOverride(res.data);
            if (res.data.custom_session_enabled) {
              setValue('preferred_session', 'MORNING');
            } else if (!res.data.morning_enabled && res.data.evening_enabled) {
              setValue('preferred_session', 'EVENING');
            } else if (res.data.morning_enabled && !res.data.evening_enabled) {
              setValue('preferred_session', 'MORNING');
            }
          } else {
            setOverride(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch schedule override', err);
      } finally {
        if (isMounted) setIsCheckingDate(false);
      }
    };
    
    const timer = setTimeout(fetchOverride, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedDate, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<{ booking_id: string }>('/bookings', data);
      toast.success('OTP sent! Please verify your phone number.');
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
              autoComplete="name"
              aria-invalid={!!errors.patient_name}
              aria-describedby={errors.patient_name ? "name-error" : undefined}
              {...register('patient_name')}
            />
          </div>
          {errors.patient_name && <span id="name-error" className="form-error" role="alert">{errors.patient_name.message}</span>}
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
              autoComplete="email"
              aria-invalid={!!errors.patient_email}
              aria-describedby={errors.patient_email ? "email-error" : undefined}
              {...register('patient_email')}
            />
          </div>
          {errors.patient_email && <span id="email-error" className="form-error" role="alert">{errors.patient_email.message}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="patient_phone">
            Phone Number *
          </label>
          <Controller
            name="patient_phone"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <PhoneInput
                id="patient_phone"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="+94 77 123 4567"
              />
            )}
          />
          {errors.patient_phone && <span id="phone-error" className="form-error" role="alert">{errors.patient_phone.message}</span>}
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
              aria-invalid={!!errors.preferred_date}
              aria-describedby={errors.preferred_date ? "date-error" : undefined}
              {...register('preferred_date')}
            />
          </div>
          {errors.preferred_date && <span id="date-error" className="form-error" role="alert">{errors.preferred_date.message}</span>}
        </div>

        {/* Session */}
        <div className="form-group" role="radiogroup" aria-labelledby="session-label">
          <label id="session-label" className="form-label">
            Preferred Session * 
            {isCheckingDate && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>(Checking availability...)</span>}
          </label>
          
          {override && !override.morning_enabled && !override.evening_enabled && !override.custom_session_enabled ? (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.875rem' }}>
              The clinic is closed on this date. Please select another date.
            </div>
          ) : (
            <div className={styles.sessionPicker}>
              {override?.custom_session_enabled ? (
                <label className={`${styles.sessionOption} ${styles.sessionSelected}`}>
                  <input type="radio" value="MORNING" className={styles.hiddenRadio} {...register('preferred_session')} />
                  <span className={styles.sessionIcon}>
                    <Calendar size={24} color="#1e40af" />
                  </span>
                  <div>
                    <div className={styles.sessionOptionName}>{override.custom_session_label || 'Special Hours'}</div>
                    <div className={styles.sessionOptionTime}>{override.custom_session_start} – {override.custom_session_end}</div>
                  </div>
                </label>
              ) : (
                <>
                  <label
                    className={`${styles.sessionOption} ${selectedSession === 'MORNING' ? styles.sessionSelected : ''}`}
                    style={{ opacity: override && !override.morning_enabled ? 0.5 : 1, cursor: override && !override.morning_enabled ? 'not-allowed' : 'pointer' }}
                  >
                    <input type="radio" value="MORNING" className={styles.hiddenRadio} disabled={override ? !override.morning_enabled : false} {...register('preferred_session')} />
                    <span className={styles.sessionIcon}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="14" cy="14" r="5.5" fill="#F5A25D" stroke="#E8884A" strokeWidth="1"/>
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
                      <div className={styles.sessionOptionTime}>
                        {override && !override.morning_enabled ? 'Unavailable' : '9 AM – 1 PM'}
                      </div>
                    </div>
                  </label>
                  <label
                    className={`${styles.sessionOption} ${selectedSession === 'EVENING' ? styles.sessionSelected : ''}`}
                    style={{ opacity: override && !override.evening_enabled ? 0.5 : 1, cursor: override && !override.evening_enabled ? 'not-allowed' : 'pointer' }}
                  >
                    <input type="radio" value="EVENING" className={styles.hiddenRadio} disabled={override ? !override.evening_enabled : false} {...register('preferred_session')} />
                    <span className={styles.sessionIcon}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M15 3C9.477 3 5 7.477 5 13C5 18.523 9.477 23 15 23C18.4 23 21.38 21.27 23.13 18.63C22.12 18.87 21.07 19 20 19C13.925 19 9 14.075 9 8C9 6.4 9.35 4.88 9.98 3.52C8.4 3.18 7 3 15 3Z" fill="#E8D89A"/>
                        <path d="M24 6 L24.6 8.4 L27 9 L24.6 9.6 L24 12 L23.4 9.6 L21 9 L23.4 8.4 Z" fill="#E8D89A"/>
                        <path d="M27 16 L27.4 17.6 L29 18 L27.4 18.4 L27 20 L26.6 18.4 L25 18 L26.6 17.6 Z" fill="#E8D89A"/>
                        <circle cx="22" cy="14" r="1.3" fill="#E8D89A"/>
                        <circle cx="25" cy="11" r="0.8" fill="#E8D89A"/>
                      </svg>
                    </span>
                    <div>
                      <div className={styles.sessionOptionName}>Evening</div>
                      <div className={styles.sessionOptionTime}>
                        {override && !override.evening_enabled ? 'Unavailable' : '5 PM – 9 PM'}
                      </div>
                    </div>
                  </label>
                </>
              )}
            </div>
          )}
          {errors.preferred_session && <span id="session-error" className="form-error" role="alert">{errors.preferred_session.message}</span>}
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${styles.submitBtn} ${loading ? 'btn-loading' : ''}`}
          disabled={loading || (override !== null && !override.morning_enabled && !override.evening_enabled && !override.custom_session_enabled)}
          aria-disabled={loading || (override !== null && !override.morning_enabled && !override.evening_enabled && !override.custom_session_enabled)}
        >
          <span aria-live="polite" className="sr-only">
            {loading ? 'Submitting your appointment details, please wait...' : ''}
          </span>
          {loading ? '' : (
            <><span>Send OTP & Continue</span><ArrowRight size={18} aria-hidden="true" /></>
          )}
        </button>

        <p className={styles.privacy}>
          <span aria-hidden="true">🔒</span> Your information is kept private and only shared with clinic staff.
        </p>
      </form>
    </div>
  );
}
