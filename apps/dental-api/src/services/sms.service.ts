import twilio from 'twilio';
import { env } from '../config/env';
import { supabase } from '../config/supabase';

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/**
 * Send a plain SMS message (used for confirmations, review requests etc).
 */
export async function sendSMS(to: string, body: string): Promise<void> {
  await client.messages.create({
    from: env.TWILIO_PHONE_NUMBER,
    to,
    body,
  });
}

/**
 * Generate a secure 6-digit OTP, save it to the booking row,
 * and deliver it to the patient's WhatsApp via the Twilio Sandbox.
 *
 * @param to        E.164 phone number, e.g. "+94776429760"
 * @param bookingId UUID of the booking row to attach the OTP to
 */
export async function sendOTP(to: string, bookingId?: string): Promise<void> {
  // 1. Generate a 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Set expiry — 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // 3. Persist the code to the booking row (so we can verify it later)
  if (bookingId) {
    await supabase
      .from('bookings')
      .update({ otp_code: code, otp_expires_at: expiresAt })
      .eq('id', bookingId);
  }

  // 4. Send via WhatsApp Sandbox
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  try {
    const msg = await client.messages.create({
      from: env.TWILIO_WHATSAPP_NUMBER,   // whatsapp:+14155238886 (Sandbox number)
      to: formattedTo,
      body: `🦷 *Charming Dental Clinic*\n\nYour verification code is: *${code}*\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    });
    console.log(`[Twilio] OTP message queued with SID: ${msg.sid}`);
  } catch (error) {
    console.error(`[Twilio] Failed to send OTP to ${formattedTo}:`, error);
    throw error;
  }
}

/**
 * Verify an OTP code by checking the stored code in the booking row.
 *
 * @param bookingId  UUID of the booking
 * @param code       6-digit code submitted by the patient
 * @returns          true if valid and not expired
 */
export async function verifyOTP(bookingId: string, code: string): Promise<boolean> {
  const { data: booking } = await supabase
    .from('bookings')
    .select('otp_code, otp_expires_at')
    .eq('id', bookingId)
    .single();

  if (!booking?.otp_code || !booking?.otp_expires_at) return false;

  const isExpired = new Date() > new Date(booking.otp_expires_at);
  if (isExpired) return false;

  return booking.otp_code === code;
}
