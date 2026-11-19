'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Package, Star, Info, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types';
import styles from './NotificationPanel.module.css';

const ICONS: Record<NotificationType, typeof Calendar> = {
  NEW_BOOKING: Calendar,
  LOW_STOCK: Package,
  NEW_REVIEW: Star,
  SYSTEM: Info,
};

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function targetFor(n: Notification): string | null {
  switch (n.type) {
    case 'NEW_BOOKING': {
      const id = n.metadata?.booking_id;
      return typeof id === 'string' ? `/admin/bookings/${id}` : '/admin/bookings';
    }
    case 'NEW_REVIEW': return '/admin/reviews';
    case 'LOW_STOCK': return '/admin/inventory';
    default: return null;
  }
}

const SEEN_DWELL_MS = 1000;

/** One row. Reports itself as "seen" once it has been visible in the panel for SEEN_DWELL_MS. */
function NotificationRow({
  n, fresh, onOpen, onSeen,
}: { n: Notification; fresh: boolean; onOpen: (n: Notification) => void; onSeen: (id: string) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const needsSeen = !n.is_read;

  useEffect(() => {
    const el = ref.current;
    if (!el || !needsSeen) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => onSeen(n.id), SEEN_DWELL_MS);
        } else if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: 0.7 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [needsSeen, n.id, onSeen]);

  const Icon = ICONS[n.type] ?? Info;
  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.item} ${fresh ? styles.unread : ''}`}
      onClick={() => onOpen(n)}
    >
      <span className={styles.icon} aria-hidden="true"><Icon size={16} /></span>
      <span className={styles.body}>
        <span className={styles.title}>{n.title}</span>
        <span className={styles.message}>{n.message}</span>
        <span className={styles.time}>{timeAgo(n.created_at)}</span>
      </span>
      {fresh && <span className={styles.dot} aria-label="New" />}
    </button>
  );
}

export default function NotificationPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  // Notifications that were unread when the panel showed them keep their highlight
  // while the panel stays open, even after they are marked read (badge goes down).
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const missing = notifications.filter((n) => !n.is_read && !fresh.has(n.id));
  if (missing.length > 0) setFresh(new Set([...fresh, ...missing.map((n) => n.id)]));

  // Mark as read once seen (each id at most once)
  const sent = useRef<Set<string>>(new Set());
  const onSeen = useCallback((id: string) => {
    if (sent.current.has(id)) return;
    sent.current.add(id);
    markRead(id);
  }, [markRead]);

  const open = (n: Notification) => {
    if (!n.is_read) onSeen(n.id);
    const href = targetFor(n);
    onClose();
    if (href) router.push(href);
  };

  return (
    <div id={id} className={styles.panel} role="dialog" aria-label="Notifications">
      <div className={styles.header}>
        <h3 className={styles.heading}>Notifications</h3>
        <button
          type="button"
          className={styles.markAll}
          onClick={() => markAllRead()}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.state}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div className={styles.state}>
            <BellOff size={28} aria-hidden="true" />
            <span>You&apos;re all caught up</span>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationRow key={n.id} n={n} fresh={fresh.has(n.id)} onOpen={open} onSeen={onSeen} />
          ))
        )}
      </div>
    </div>
  );
}
