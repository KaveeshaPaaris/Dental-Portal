'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

function OTPVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('id');
  const phone = searchParams.get('phone');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter the full 6-digit code.'); return; }
    if (!bookingId || !phone) { toast.error('Invalid session. Please start over.'); return; }

    setLoading(true);
    try {
      await api.post('/bookings/verify-otp', { booking_id: bookingId, phone, code });
      toast.success('Booking confirmed! We will contact you shortly.');
      router.push('/?booked=true');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Invalid OTP.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!bookingId || !phone || countdown > 0) return;
    setResending(true);
    try {
      await api.post('/bookings/resend-otp', { booking_id: bookingId, phone });
      toast.success('New OTP sent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone ? `${phone.slice(0, -4).replace(/\d/g, '•')}${phone.slice(-4)}` : '';

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.icon}><ShieldCheck size={32} /></div>
          <h1 className={styles.title}>Verify Your Phone</h1>
          <p className={styles.subtitle}>
            We sent a 6-digit code to <strong>{maskedPhone}</strong>.
            <br />Enter it below to confirm your booking.
          </p>

          <div className={styles.otpRow} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`${styles.otpInput} ${digit ? styles.otpFilled : ''}`}
                aria-label={`OTP digit ${i + 1}`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            className={`btn btn-primary ${styles.verifyBtn} ${loading ? 'btn-loading' : ''}`}
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? '' : 'Confirm Booking'}
          </button>

          <div className={styles.resendRow}>
            <span className={styles.resendText}>Didn't receive it?</span>
            {countdown > 0 ? (
              <span className={styles.countdown}>Resend in {countdown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className={`btn btn-ghost btn-sm ${styles.resendBtn}`}
              >
                <RefreshCw size={14} className={resending ? styles.spinning : ''} />
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OTPVerifyPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--color-text-secondary)' }}>Loading...</div>}>
      <OTPVerifyContent />
    </Suspense>
  );
}
