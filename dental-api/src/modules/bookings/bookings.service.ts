import { supabase } from '../../config/supabase';
import { sendOTP, verifyOTP, sendSMS } from '../../services/sms.service';
import { sendWhatsApp } from '../../services/whatsapp.service';
import { sendEmail, bookingConfirmationEmail, reviewRequestEmail } from '../../services/email.service';
import { getNextAppointmentNumber, getNextSlotOrder } from '../../utils/appointment.util';
import { generateReviewToken } from '../../utils/token.util';
import { createError } from '../../middleware/error.middleware';
import { env } from '../../config/env';
import type {
  CreateBookingInput,
  AdminCreateBookingInput,
  AcceptBookingInput,
} from './bookings.schema';

// ─── PUBLIC ──────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput) {
  // Create booking in PENDING_OTP state
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      patient_name: input.patient_name,
      patient_email: input.patient_email || null,
      patient_phone: input.patient_phone,
      preferred_date: input.preferred_date,
      preferred_session: input.preferred_session,
      source: 'ONLINE',
      status: 'PENDING_OTP',
    })
    .select()
    .single();

  if (error || !booking) throw createError('Failed to create booking', 500);

  // Trigger OTP via Twilio Verify
  await sendOTP(input.patient_phone);

  return { booking_id: booking.id, message: 'OTP sent to your phone number.' };
}

export async function verifyBookingOTP(bookingId: string, phone: string, code: string) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, status, patient_phone')
    .eq('id', bookingId)
    .single();

  if (error || !booking) throw createError('Booking not found', 404);
  if (booking.status !== 'PENDING_OTP') throw createError('OTP already verified or booking in invalid state', 400);
  if (booking.patient_phone !== phone) throw createError('Phone number mismatch', 400);

  const approved = await verifyOTP(phone, code);
  if (!approved) throw createError('Invalid or expired OTP code', 400);

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'PENDING_REVIEW', otp_verified: true })
    .eq('id', bookingId);

  if (updateError) throw createError('Failed to update booking status', 500);

  return { message: 'OTP verified. Your booking request has been sent to the clinic.' };
}

export async function resendBookingOTP(bookingId: string, phone: string) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, status, patient_phone')
    .eq('id', bookingId)
    .single();

  if (error || !booking) throw createError('Booking not found', 404);
  if (booking.status !== 'PENDING_OTP') throw createError('OTP not required for this booking', 400);
  if (booking.patient_phone !== phone) throw createError('Phone number mismatch', 400);

  await sendOTP(phone);
  return { message: 'OTP resent successfully.' };
}

// ─── ADMIN ───────────────────────────────────────────────────

export async function getBookings(filters: {
  status?: string;
  date?: string;
  session?: string;
}) {
  let query = supabase
    .from('bookings')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.date) query = query.eq('assigned_date', filters.date);
  if (filters.session) query = query.eq('assigned_session', filters.session);

  const { data, error } = await query;
  if (error) throw createError('Failed to fetch bookings', 500);
  return data;
}

export async function getDailySchedule(date: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('assigned_date', date)
    .eq('status', 'ACCEPTED')
    .order('slot_order', { ascending: true });

  if (error) throw createError('Failed to fetch schedule', 500);

  const morning = data?.filter((b) => b.assigned_session === 'MORNING') ?? [];
  const evening = data?.filter((b) => b.assigned_session === 'EVENING') ?? [];

  return { date, morning, evening };
}

export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .single();

  if (error || !data) throw createError('Booking not found', 404);
  return data;
}

export async function adminCreateBooking(input: AdminCreateBookingInput, adminId: string) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      patient_name: input.patient_name,
      patient_email: input.patient_email || null,
      patient_phone: input.patient_phone,
      preferred_date: input.preferred_date,
      preferred_session: input.preferred_session,
      source: input.source,
      status: 'PENDING_REVIEW', // Admin-created bookings skip OTP
      otp_verified: true,
      notes: input.notes || null,
      handled_by: adminId,
    })
    .select()
    .single();

  if (error || !booking) throw createError('Failed to create booking', 500);
  return booking;
}

export async function acceptBooking(id: string, input: AcceptBookingInput, adminId: string) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('id', id)
    .single();

  if (!booking) throw createError('Booking not found', 404);
  if (booking.status !== 'PENDING_REVIEW') throw createError('Booking is not in PENDING_REVIEW state', 400);

  const appointmentNumber = await getNextAppointmentNumber(input.assigned_date, input.assigned_session);
  const slotOrder = await getNextSlotOrder(input.assigned_date, input.assigned_session);

  const { data: updated, error } = await supabase
    .from('bookings')
    .update({
      status: 'ACCEPTED',
      assigned_date: input.assigned_date,
      assigned_session: input.assigned_session,
      appointment_number: appointmentNumber,
      slot_order: slotOrder,
      handled_by: adminId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) throw createError('Failed to accept booking', 500);
  return updated;
}

export async function rejectBooking(id: string, adminId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'REJECTED', handled_by: adminId })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw createError('Failed to reject booking', 500);
  return data;
}

export async function completeBooking(id: string, adminId: string) {
  const reviewToken = generateReviewToken();

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      status: 'COMPLETED',
      review_token: reviewToken,
      review_token_sent_at: new Date().toISOString(),
      handled_by: adminId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !booking) throw createError('Failed to complete booking', 500);

  const reviewLink = `${env.FRONTEND_URL}/review/${reviewToken}`;

  // Fire all three notification channels in parallel
  const notificationPromises = [
    sendSMS(
      booking.patient_phone,
      `Hi ${booking.patient_name}! Thank you for visiting Smile Dental Clinic. Please share your feedback: ${reviewLink}`
    ),
    sendWhatsApp(
      booking.patient_phone,
      `Hi ${booking.patient_name}! 🦷 Thank you for visiting us. We'd love your feedback: ${reviewLink}`
    ),
  ];

  if (booking.patient_email) {
    notificationPromises.push(
      sendEmail({
        to: booking.patient_email,
        subject: 'Thank you for your visit — Share your feedback',
        html: reviewRequestEmail({ patientName: booking.patient_name, reviewLink }),
      })
    );
  }

  // Don't block response on notification delivery
  Promise.allSettled(notificationPromises);

  return booking;
}

export async function sendBookingConfirmation(id: string) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (!booking) throw createError('Booking not found', 404);
  if (booking.status !== 'ACCEPTED') throw createError('Booking is not accepted yet', 400);

  const dateStr = new Date(booking.assigned_date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const message = `Hi ${booking.patient_name}! Your appointment #${booking.appointment_number} is confirmed for ${dateStr} (${booking.assigned_session} session). See you soon! — Smile Dental Clinic`;

  const promises = [
    sendSMS(booking.patient_phone, message),
    sendWhatsApp(booking.patient_phone, message),
  ];

  if (booking.patient_email) {
    promises.push(
      sendEmail({
        to: booking.patient_email,
        subject: `Appointment #${booking.appointment_number} Confirmed`,
        html: bookingConfirmationEmail({
          patientName: booking.patient_name,
          appointmentNumber: booking.appointment_number,
          date: dateStr,
          session: booking.assigned_session,
        }),
      })
    );
  }

  await Promise.allSettled(promises);
  return { message: 'Confirmation sent.' };
}

export async function reorderBooking(id: string, slotOrder: number) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ slot_order: slotOrder })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw createError('Failed to reorder booking', 500);
  return data;
}
