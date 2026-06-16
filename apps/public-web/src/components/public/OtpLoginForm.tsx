'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Phone, ArrowRight, Shield, RefreshCw, CheckCircle } from 'lucide-react';
import styles from './OtpLoginForm.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
const RESEND_COOLDOWN = 60; // seconds

type Step = 'phone' | 'otp';

export default function OtpLoginForm() {
  const router = useRouter();

  const [step, setStep]         = useState<Step>('phone');
  const [phone, setPhone]       = useState('');
  const [countryCode, setCountryCode] = useState('+94'); // Sri Lanka default
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for Resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return toast.error('Please enter your phone number.');

    const fullPhone = `${countryCode}${phone.replace(/^0/, '')}`;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/send-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success('WhatsApp OTP sent! Check your messages.');
      setStep('otp');
      setCooldown(RESEND_COOLDOWN);
      // Focus first OTP input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input Handling ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    // Auto-advance to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits are entered
    if (updated.every((d) => d) && updated.join('').length === 6) {
      handleVerifyOtp(updated.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleVerifyOtp = async (code?: string) => {
    const finalCode = code ?? otp.join('');
    if (finalCode.length !== 6) return toast.error('Please enter the full 6-digit code.');

    const fullPhone = `${countryCode}${phone.replace(/^0/, '')}`;
    setLoading(true);

    try {
      // 1. Ask backend to verify with Twilio
      const res = await fetch(`${API_URL}/auth/verify-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: finalCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      // 2. Backend said OK — now complete the Supabase auth session client-side
      //    Supabase phone OTP is signed in via verifyOtp (type: 'sms')
      const { error: supaErr } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: finalCode,
        type: 'sms',
      });

      if (supaErr) {
        // If Supabase phone auth isn't enabled, log the warning but still allow
        // backend-verified flow (you can handle auth however you like).
        console.warn('[OTP] Supabase phone session could not be created:', supaErr.message);
      }

      toast.success(data.message || 'You are now logged in!');
      router.push('/book');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed.');
      // Clear OTP boxes on error
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    const fullPhone = `${countryCode}${phone.replace(/^0/, '')}`;
    try {
      const res = await fetch(`${API_URL}/auth/send-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('A new OTP has been sent to your WhatsApp.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render: Phone Step ────────────────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className={styles.form}>
        <div className={styles.icon}><Phone size={24} /></div>
        <h2 className={styles.title}>Patient Login</h2>
        <p className={styles.subtitle}>
          Enter your WhatsApp number and we&apos;ll send you a one-time code.
        </p>

        <form onSubmit={handleSendOtp} className={styles.fields} noValidate>
          <div className={styles.phoneRow}>
            <select
              className={styles.countrySelect}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              aria-label="Country code"
            >
              <option value="+94">🇱🇰 +94</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+60">🇲🇾 +60</option>
            </select>
            <input
              className={styles.phoneInput}
              type="tel"
              placeholder="077 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel-national"
              required
              aria-label="Phone number"
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn} ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {!loading && (
              <>Send OTP via WhatsApp <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className={styles.notice}>
          <Shield size={12} />
          We only send OTPs — no spam, ever.
        </p>
      </div>
    );
  }

  // ── Render: OTP Verification Step ─────────────────────────────────────────
  return (
    <div className={styles.form}>
      <div className={`${styles.icon} ${styles.iconSuccess}`}><CheckCircle size={24} /></div>
      <h2 className={styles.title}>Check WhatsApp</h2>
      <p className={styles.subtitle}>
        We sent a 6-digit code to{' '}
        <strong>{countryCode} {phone}</strong> on WhatsApp.
      </p>

      <div className={styles.otpRow} role="group" aria-label="One-time password input">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            className={styles.otpInput}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      <button
        type="button"
        className={`btn btn-primary ${styles.submitBtn} ${loading ? 'btn-loading' : ''}`}
        disabled={loading}
        onClick={() => handleVerifyOtp()}
      >
        {!loading && <>Verify &amp; Log In <ArrowRight size={16} /></>}
      </button>

      <div className={styles.resendRow}>
        <button
          type="button"
          className={styles.resendBtn}
          onClick={handleResend}
          disabled={cooldown > 0 || loading}
        >
          <RefreshCw size={14} />
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
        </button>
        <button
          type="button"
          className={styles.changePhone}
          onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
        >
          Change number
        </button>
      </div>
    </div>
  );
}
