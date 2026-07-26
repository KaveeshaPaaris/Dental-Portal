import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';
import type { CreateOverrideInput } from './schedule.schema';

export async function getOverrides(from: string, to: string) {
  const { data, error } = await supabase
    .from('clinic_schedule_overrides')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });

  if (error) throw createError('Failed to fetch schedule overrides', 500);
  return data;
}

export async function getOverrideByDate(date: string) {
  const { data, error } = await supabase
    .from('clinic_schedule_overrides')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (error) throw createError('Failed to fetch schedule override', 500);
  return data; // null if not found
}

export async function upsertOverride(input: CreateOverrideInput, adminId: string) {
  // Check if it exists
  const { data: existing } = await supabase
    .from('clinic_schedule_overrides')
    .select('id')
    .eq('date', input.date)
    .maybeSingle();

  let result;
  
  if (existing) {
    const { data, error } = await supabase
      .from('clinic_schedule_overrides')
      .update({
        morning_enabled: input.morning_enabled,
        evening_enabled: input.evening_enabled,
        custom_session_enabled: input.custom_session_enabled,
        custom_session_label: input.custom_session_label || null,
        custom_session_start: input.custom_session_start || null,
        custom_session_end: input.custom_session_end || null,
        reason: input.reason || null,
      })
      .eq('date', input.date)
      .select()
      .single();
    if (error) throw createError('Failed to update override', 500);
    result = data;
  } else {
    const { data, error } = await supabase
      .from('clinic_schedule_overrides')
      .insert({
        date: input.date,
        morning_enabled: input.morning_enabled,
        evening_enabled: input.evening_enabled,
        custom_session_enabled: input.custom_session_enabled,
        custom_session_label: input.custom_session_label || null,
        custom_session_start: input.custom_session_start || null,
        custom_session_end: input.custom_session_end || null,
        reason: input.reason || null,
        created_by: adminId,
      })
      .select()
      .single();
    if (error) throw createError('Failed to create override', 500);
    result = data;
  }
  
  return result;
}

export async function deleteOverride(date: string) {
  const { data, error } = await supabase
    .from('clinic_schedule_overrides')
    .delete()
    .eq('date', date)
    .select()
    .single();

  if (error) throw createError('Failed to delete override', 500);
  return data;
}
