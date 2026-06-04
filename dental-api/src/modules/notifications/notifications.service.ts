import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

export async function getNotifications(role: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`target_role.eq.ALL,target_role.eq.${role}`)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw createError('Failed to fetch notifications', 500);
  return data;
}

export async function markAsRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw createError('Failed to update notification', 500);
  return data;
}

export async function markAllAsRead(role: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .or(`target_role.eq.ALL,target_role.eq.${role}`)
    .eq('is_read', false);
  if (error) throw createError('Failed to mark all as read', 500);
  return { message: 'All notifications marked as read.' };
}
