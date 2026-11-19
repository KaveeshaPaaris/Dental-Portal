'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Notification } from '@/types';

const KEY = ['notifications'];

/** Shared notifications state for the top bar, panel and dashboard. */
export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get<Notification[]>('/admin/notifications').then((r) => r.data),
    refetchInterval: 30000,
  });

  const optimistic = async (update: (list: Notification[]) => Notification[]) => {
    await queryClient.cancelQueries({ queryKey: KEY });
    const previous = queryClient.getQueryData<Notification[]>(KEY);
    if (previous) queryClient.setQueryData<Notification[]>(KEY, update(previous));
    return { previous };
  };
  const rollback = (_e: unknown, _v: unknown, ctx?: { previous?: Notification[] }) => {
    if (ctx?.previous) queryClient.setQueryData(KEY, ctx.previous);
  };

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/notifications/${id}/read`).then((r) => r.data),
    onMutate: (id) => optimistic((list) => list.map((n) => (n.id === id ? { ...n, is_read: true } : n))),
    onError: rollback,
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/admin/notifications/read-all').then((r) => r.data),
    onMutate: () => optimistic((list) => list.map((n) => ({ ...n, is_read: true }))),
    onError: rollback,
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markRead: markRead.mutate,
    markAllRead: () => markAllRead.mutate(undefined),
  };
}
