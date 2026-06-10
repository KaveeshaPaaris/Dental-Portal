import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

export async function getPublicReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, patient_name, content, rating, created_at')
    .eq('status', 'ACCEPTED')
    .order('created_at', { ascending: false });

  if (error) throw createError('Failed to fetch reviews', 500);
  return data;
}

export async function validateReviewToken(token: string) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, patient_name, status, review_token')
    .eq('review_token', token)
    .single();

  if (error || !booking) throw createError('Invalid or expired review link', 404);
  if (booking.status !== 'COMPLETED') throw createError('This review link is not active', 400);

  // Check if review already submitted for this booking
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', booking.id)
    .single();

  if (existingReview) throw createError('Review already submitted for this appointment', 409);

  return { patient_name: booking.patient_name, booking_id: booking.id };
}

export async function submitReview(token: string, content: string, rating?: number) {
  const validated = await validateReviewToken(token);

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, patient_name')
    .eq('review_token', token)
    .single();

  if (!booking) throw createError('Booking not found', 404);

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: booking.id,
      patient_name: booking.patient_name,
      content,
      rating: rating ?? null,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error || !review) throw createError('Failed to submit review', 500);

  // Invalidate the token by clearing it
  await supabase.from('bookings').update({ review_token: null }).eq('id', booking.id);

  return { message: 'Thank you! Your review has been submitted.' };
}

export async function getAllReviews(status?: string) {
  let query = supabase
    .from('reviews')
    .select('*, bookings(patient_phone, preferred_date)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw createError('Failed to fetch reviews', 500);
  return data;
}

export async function moderateReview(id: string, action: 'ACCEPTED' | 'REJECTED', adminId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      status: action,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw createError('Failed to update review', 500);
  return data;
}
