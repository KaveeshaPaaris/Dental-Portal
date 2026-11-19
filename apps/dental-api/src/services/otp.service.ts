import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { env } from '../config/env';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/error.middleware';
import { sendEmail, otpEmail } from './email.service';

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_RESENDS = 3;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

// HMAC key: dedicated OTP_SECRET if set, otherwise derived from an existing server secret.
const OTP_KEY = env.OTP_SECRET ?? env.SUPABASE_JWT_SECRET;

function hashCode(bookingId: string, code: string): string {
  return createHmac('sha256', OTP_KEY).update(`${bookingId}:${code}`).digest('hex');
}

function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/** j***@gmail.com — safe to show on the verify page. */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 1)}***@${domain}`;
}

/**
 * Create a fresh code for a booking, store its hash and email it to the patient.
 * Throws if the email could not be sent.
 */
export async function issueOtp(booking: { id: string; patient_name: string; patient_email: string }) {
  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

  const { error } = await supabase
    .from('bookings')
    .update({
      otp_code: hashCode(booking.id, code),
      otp_expires_at: expiresAt.toISOString(),
      otp_attempts: 0,
      otp_last_sent_at: now.toISOString(),
    })
    .eq('id', booking.id);
  if (error) throw createError('Failed to create verification code', 500);

  await sendEmail({
    to: booking.patient_email,
    subject: 'Your Charming Dental verification code',
    html: otpEmail({ patientName: booking.patient_name, code, minutes: OTP_TTL_MINUTES }),
    text: `Your Charming Dental Clinic verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.`,
  });
}

/** Re-send a code (respects cooldown and max resends). */
export async function resendOtp(bookingId: string) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, status, patient_name, patient_email, otp_resend_count, otp_last_sent_at')
    .eq('id', bookingId)
    .single();

  if (error || !booking) throw createError('Booking not found', 404);
  if (booking.status !== 'PENDING_OTP') throw createError('This booking is already verified', 400);
  if (!booking.patient_email) throw createError('No email on this booking', 400);

  if ((booking.otp_resend_count ?? 0) >= OTP_MAX_RESENDS) {
    throw createError('Too many code requests. Please start a new booking.', 429);
  }
  if (booking.otp_last_sent_at) {
    const waited = (Date.now() - new Date(booking.otp_last_sent_at).getTime()) / 1000;
    if (waited < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - waited);
      throw createError(`Please wait ${wait} seconds before requesting a new code.`, 429);
    }
  }

  await supabase
    .from('bookings')
    .update({ otp_resend_count: (booking.otp_resend_count ?? 0) + 1 })
    .eq('id', bookingId);

  await issueOtp({ id: booking.id, patient_name: booking.patient_name, patient_email: booking.patient_email });
  return { email: maskEmail(booking.patient_email) };
}

/**
 * Check a code. On success the code is wiped and the booking moves to PENDING_REVIEW.
 * Wrong guesses are counted; after OTP_MAX_ATTEMPTS the code is dead.
 */
export async function verifyOtp(bookingId: string, code: string) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, status, otp_code, otp_expires_at, otp_attempts')
    .eq('id', bookingId)
    .single();

  if (error || !booking) throw createError('Booking not found', 404);
  if (booking.status !== 'PENDING_OTP') throw createError('This booking is already verified', 400);
  if (!booking.otp_code || !booking.otp_expires_at) {
    throw createError('No active code. Please request a new one.', 400);
  }
  if ((booking.otp_attempts ?? 0) >= OTP_MAX_ATTEMPTS) {
    throw createError('Too many wrong attempts. Please request a new code.', 429);
  }
  if (new Date() > new Date(booking.otp_expires_at)) {
    throw createError('This code has expired. Please request a new one.', 400);
  }

  // Count the attempt first so parallel guesses cannot dodge the limit.
  await supabase
    .from('bookings')
    .update({ otp_attempts: (booking.otp_attempts ?? 0) + 1 })
    .eq('id', bookingId);

  const expected = Buffer.from(booking.otp_code, 'hex');
  const given = Buffer.from(hashCode(bookingId, code), 'hex');
  const ok = expected.length === given.length && timingSafeEqual(expected, given);
  if (!ok) throw createError('Incorrect code. Please try again.', 400);

  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'PENDING_REVIEW',
      otp_verified: true,
      otp_code: null,
      otp_expires_at: null,
    })
    .eq('id', bookingId)
    .eq('status', 'PENDING_OTP')
    .select('id')
    .single();

  if (updateError || !updated) throw createError('Failed to confirm booking', 500);
}
