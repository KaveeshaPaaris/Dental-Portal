import { z } from 'zod';

export const createBookingSchema = z.object({
  patient_name: z.string().min(2, 'Name must be at least 2 characters'),
  patient_email: z.string().email().optional().or(z.literal('')),
  patient_phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must include country code (e.g. +94771234567)'),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  preferred_session: z.enum(['MORNING', 'EVENING']),
});

export const verifyOTPSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must include country code (e.g. +94771234567)'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export const resendOTPSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must include country code (e.g. +94771234567)'),
});

export const adminCreateBookingSchema = z.object({
  patient_name: z.string().min(2),
  patient_email: z.string().email().optional().or(z.literal('')),
  patient_phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must include country code (e.g. +94771234567)'),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_session: z.enum(['MORNING', 'EVENING']),
  source: z.enum(['PHONE', 'WHATSAPP']),
  notes: z.string().optional(),
});

export const acceptBookingSchema = z.object({
  assigned_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  assigned_session: z.enum(['MORNING', 'EVENING']),
});

export const reorderBookingSchema = z.object({
  slot_order: z.number().int().positive(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING_OTP', 'PENDING_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional().nullable(),
  assigned_session: z.enum(['MORNING', 'EVENING']).optional().nullable(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type AdminCreateBookingInput = z.infer<typeof adminCreateBookingSchema>;
export type AcceptBookingInput = z.infer<typeof acceptBookingSchema>;
