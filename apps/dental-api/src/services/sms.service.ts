import twilio from 'twilio';
import { env } from '../config/env';

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/**
 * Send an SMS message to a patient phone number.
 * @param to   E.164 phone number e.g. "+15551234567"
 * @param body Message text
 */
export async function sendSMS(to: string, body: string): Promise<void> {
  await client.messages.create({
    from: env.TWILIO_PHONE_NUMBER,
    to,
    body,
  });
}

/**
 * Initiate an OTP verification via Twilio Verify API.
 * Twilio handles code generation, expiry, and rate limiting.
 * @param to E.164 phone number
 */
export async function sendOTP(to: string): Promise<void> {
  await client.verify.v2
    .services(env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to, channel: 'sms' });
}

/**
 * Verify an OTP code submitted by the patient.
 * @returns true if the code is valid and approved
 */
export async function verifyOTP(to: string, code: string): Promise<boolean> {
  const check = await client.verify.v2
    .services(env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to, code });

  return check.status === 'approved';
}
