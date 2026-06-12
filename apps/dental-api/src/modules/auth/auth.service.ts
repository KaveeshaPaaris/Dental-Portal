import twilio from 'twilio';
import { env } from '../../config/env';
import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/**
 * Sends a WhatsApp OTP to the given E.164 phone number via Twilio Verify.
 * Twilio handles code generation, storage, and 10-min expiry automatically.
 *
 * @param phone  E.164 format e.g. "+919876543210"
 */
export async function sendWhatsappOtp(phone: string): Promise<void> {
  try {
    await client.verify.v2
      .services(env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: 'whatsapp',
      });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Auth] Twilio send-OTP error:', msg);
    throw createError(`Could not send WhatsApp OTP. ${msg}`, 502);
  }
}

/**
 * Verifies the OTP code entered by the patient using Twilio Verify.
 * If the code is valid, we ensure the patient has a record in our `patients` table.
 *
 * @param phone  E.164 format e.g. "+919876543210"
 * @param code   6-digit code from the WhatsApp message
 * @returns      { isNewUser, phone }  — frontend completes the Supabase session itself
 */
export async function verifyWhatsappOtp(
  phone: string,
  code: string
): Promise<{ isNewUser: boolean; phone: string }> {
  // ── 1. Validate the OTP with Twilio ──────────────────────────────────────
  let check;
  try {
    check = await client.verify.v2
      .services(env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Auth] Twilio verify-OTP error:', msg);
    throw createError(`OTP verification failed. ${msg}`, 502);
  }

  if (check.status !== 'approved') {
    throw createError('Invalid or expired OTP code. Please try again.', 400);
  }

  // ── 2. Find or create a patient record in our DB ──────────────────────────
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  let isNewUser = false;

  if (!existingPatient) {
    // First-time patient — create their profile in our patients table.
    // Note: Supabase Auth user for phone is created by the frontend via
    // supabase.auth.signInWithOtp({ phone }) + supabase.auth.verifyOtp({ phone, token, type:'sms' })
    // We only create our application-level patients table row here.
    const { error: insertErr } = await supabase
      .from('patients')
      .insert({ phone });

    if (insertErr) {
      console.error('[Auth] Failed to create patient row:', insertErr.message);
      // Non-fatal — the OTP was still valid. Don't block login.
    }
    isNewUser = true;
  }

  return { isNewUser, phone };
}
