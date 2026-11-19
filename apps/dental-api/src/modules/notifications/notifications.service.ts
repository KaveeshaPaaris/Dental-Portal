import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

type Role = 'ADMIN' | 'SUPER_ADMIN';

/** ADMIN sees ALL + ADMIN. SUPER_ADMIN sees ALL + ADMIN + SUPER_ADMIN. */
function visibleTargets(role: Role): string[] {
  return role === 'SUPER_ADMIN' ? ['ALL', 'ADMIN', 'SUPER_ADMIN'] : ['ALL', 'ADMIN'];
}

export async function getNotifications(role: Role, userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, metadata, target_role, created_at')
    .in('target_role', visibleTargets(role))
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw createError('Failed to fetch notifications', 500);

  const list = data ?? [];
  if (list.length === 0) return [];

  const { data: reads, error: readsError } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', userId)
    .in('notification_id', list.map((n) => n.id));
  if (readsError) throw createError('Failed to fetch notifications', 500);

  const readIds = new Set((reads ?? []).map((r) => r.notification_id));
  return list.map((n) => ({ ...n, is_read: readIds.has(n.id) }));
}

export async function markAsRead(id: string, role: Role, userId: string) {
  const { data: notification, error } = await supabase
    .from('notifications')
    .select('id')
    .eq('id', id)
    .in('target_role', visibleTargets(role))
    .maybeSingle();
  if (error) throw createError('Failed to update notification', 500);
  if (!notification) throw createError('Notification not found', 404);

  const { error: upsertError } = await supabase
    .from('notification_reads')
    .upsert(
      { notification_id: id, user_id: userId },
      { onConflict: 'notification_id,user_id', ignoreDuplicates: true }
    );
  if (upsertError) throw createError('Failed to update notification', 500);
  return { id, is_read: true };
}

export async function markAllAsRead(role: Role, userId: string) {
  const { data: visible, error } = await supabase
    .from('notifications')
    .select('id')
    .in('target_role', visibleTargets(role))
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) throw createError('Failed to mark all as read', 500);
  if (!visible || visible.length === 0) return { message: 'All notifications marked as read.' };

  const { error: upsertError } = await supabase
    .from('notification_reads')
    .upsert(
      visible.map((n) => ({ notification_id: n.id, user_id: userId })),
      { onConflict: 'notification_id,user_id', ignoreDuplicates: true }
    );
  if (upsertError) throw createError('Failed to mark all as read', 500);
  return { message: 'All notifications marked as read.' };
}
