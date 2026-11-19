'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Sun, Moon } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import styles from './TopBar.module.css';

export default function AdminTopBar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();

  // Panel is open only for the route it was opened on, so navigating closes it
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(open) : v;
    setOpenAt(next ? pathname : null);
  };
  const wrapRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  // Close on outside click / Esc (Esc returns focus to the bell)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenAt(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenAt(null);
        bellRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const closePanel = () => {
    setOpen(false);
    bellRef.current?.focus();
  };

  return (
    <header className="admin-topbar">
      <div className={styles.title}>
        <h2>Admin Portal</h2>
      </div>

      <div className={styles.spacer} />

      <div className={styles.actions}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`btn btn-ghost btn-sm ${styles.iconBtn}`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div ref={wrapRef} style={{ position: 'relative' }}>
          <button
            ref={bellRef}
            onClick={() => setOpen((v) => !v)}
            className={`btn btn-ghost btn-sm ${styles.iconBtn} ${styles.bellBtn}`}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="notification-panel"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          {open && <NotificationPanel id="notification-panel" onClose={closePanel} />}
        </div>

        {/* User Avatar */}
        <div className={styles.avatar}>
          {user?.full_name?.[0]?.toUpperCase() ?? 'A'}
        </div>
      </div>
    </header>
  );
}
