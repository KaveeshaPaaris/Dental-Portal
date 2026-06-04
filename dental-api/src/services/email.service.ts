import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a transactional email via Resend.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  await resend.emails.send({
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

// ─── Email Templates ─────────────────────────────────────────

export function bookingConfirmationEmail(data: {
  patientName: string;
  appointmentNumber: number;
  date: string;
  session: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0F4C81;">Appointment Confirmed ✅</h2>
      <p>Dear <strong>${data.patientName}</strong>,</p>
      <p>Your appointment has been confirmed. Here are your details:</p>
      <div style="background: #F8FBFD; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p><strong>Appointment Number:</strong> #${data.appointmentNumber}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Session:</strong> ${data.session}</p>
      </div>
      <p>Please arrive 10 minutes early. See you soon! 😊</p>
      <p style="color: #64748B; font-size: 14px;">— Smile Dental Clinic</p>
    </div>
  `;
}

export function reviewRequestEmail(data: {
  patientName: string;
  reviewLink: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0F4C81;">Thank You for Visiting! 🦷</h2>
      <p>Dear <strong>${data.patientName}</strong>,</p>
      <p>We hope your treatment went well! We'd love to hear your feedback.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.reviewLink}"
           style="background: #0F4C81; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Share Your Feedback
        </a>
      </div>
      <p style="color: #64748B; font-size: 14px;">This link is unique to you and can only be used once.</p>
      <p style="color: #64748B; font-size: 14px;">— Smile Dental Clinic</p>
    </div>
  `;
}
