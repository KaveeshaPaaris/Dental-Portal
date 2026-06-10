import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

export async function getContentByKey(key: string) {
  const { data, error } = await supabase.from('site_content').select('key, value, label').eq('key', key).single();
  if (error || !data) throw createError('Content key not found', 404);
  return data;
}

export async function getAllContent() {
  const { data, error } = await supabase.from('site_content').select('*').order('key', { ascending: true });
  if (error) throw createError('Failed to fetch content', 500);
  return data;
}

export async function updateContent(key: string, value: unknown, adminId: string) {
  const { data, error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_by: adminId, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error || !data) throw createError('Failed to update content', 500);
  return data;
}
