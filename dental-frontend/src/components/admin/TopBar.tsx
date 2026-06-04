'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Bell, Sun, Moon } from 'lucide-react';
import type { Notification } from '@/types';
import styles from './TopBar.module.css';

export default function AdminTopBar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/admin/notifications').then((r) => r.data),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

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
        <button className={`btn btn-ghost btn-sm ${styles.iconBtn} ${styles.bellBtn}`} aria-label="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* User Avatar */}
        <div className={styles.avatar}>
          {user?.full_name?.[0]?.toUpperCase() ?? 'A'}
        </div>
      </div>
    </header>
  );
}
