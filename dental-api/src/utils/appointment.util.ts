import { supabase } from '../config/supabase';

/**
 * Get the next appointment number for a given date and session.
 * Appointment numbers are sequential (1, 2, 3...) per day per session.
 */
export async function getNextAppointmentNumber(
  date: string,
  session: 'MORNING' | 'EVENING'
): Promise<number> {
  const { data, error } = await supabase
    .from('bookings')
    .select('appointment_number')
    .eq('assigned_date', date)
    .eq('assigned_session', session)
    .eq('status', 'ACCEPTED')
    .order('appointment_number', { ascending: false })
    .limit(1)
    .single();

  if (error || !data?.appointment_number) {
    return 1;
  }

  return data.appointment_number + 1;
}

/**
 * Get the next slot_order for drag-and-drop positioning.
 */
export async function getNextSlotOrder(
  date: string,
  session: 'MORNING' | 'EVENING'
): Promise<number> {
  const { data, error } = await supabase
    .from('bookings')
    .select('slot_order')
    .eq('assigned_date', date)
    .eq('assigned_session', session)
    .eq('status', 'ACCEPTED')
    .order('slot_order', { ascending: false })
    .limit(1)
    .single();

  if (error || !data?.slot_order) {
    return 1;
  }

  return data.slot_order + 1;
}
