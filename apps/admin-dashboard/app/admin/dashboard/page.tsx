'use client';
export const dynamic = 'force-dynamic';


import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Calendar, Star, Package, Bell, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Booking, Review, InventoryItem, Notification } from '@/types';
import styles from './page.module.css';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: bookings } = useQuery({
    queryKey: ['bookings', 'dashboard'],
    queryFn: () => api.get<Booking[]>('/admin/bookings?status=PENDING_REVIEW').then((r) => r.data),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', 'pending'],
    queryFn: () => api.get<Review[]>('/admin/reviews?status=PENDING').then((r) => r.data),
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory', 'low'],
    queryFn: () =>
      api.get<InventoryItem[]>('/admin/inventory').then((r) =>
        r.data.filter((i) => i.is_low_stock)
      ),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/admin/notifications').then((r) => r.data),
    refetchInterval: 30000,
  });

  const unread = notifications?.filter((n) => !n.is_read) ?? [];

  const stats = [
    {
      label: 'Pending Bookings',
      value: bookings?.length ?? 0,
      icon: Calendar,
      color: 'var(--color-warning)',
      bg: 'rgba(245,158,11,0.1)',
      href: '/admin/bookings',
    },
    {
      label: 'Pending Reviews',
      value: reviews?.length ?? 0,
      icon: Star,
      color: 'var(--color-info)',
      bg: 'rgba(59,130,246,0.1)',
      href: '/admin/reviews',
    },
    {
      label: 'Low Stock Items',
      value: inventory?.length ?? 0,
      icon: Package,
      color: 'var(--color-error)',
      bg: 'rgba(239,68,68,0.1)',
      href: '/admin/inventory',
    },
    {
      label: 'Unread Alerts',
      value: unread.length,
      icon: Bell,
      color: 'var(--color-primary)',
      bg: 'rgba(78,168,255,0.1)',
      href: '#',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ color, background: bg }}>
              <Icon size={22} />
            </div>
            <div className={styles.statValue}>{value}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {/* Pending Bookings */}
        <div className={`card ${styles.panel}`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}><Calendar size={18} /> Pending Bookings</h2>
            <a href="/admin/bookings" className="btn btn-ghost btn-sm">View All</a>
          </div>
          {bookings && bookings.length > 0 ? (
            <div className={styles.list}>
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className={styles.listItem}>
                  <div className={styles.listAvatar}>{b.patient_name[0]}</div>
                  <div className={styles.listInfo}>
                    <div className={styles.listName}>{b.patient_name}</div>
                    <div className={styles.listMeta}>
                      <Clock size={12} /> {b.preferred_date} · {b.preferred_session}
                    </div>
                  </div>
                  <span className="badge badge-pending">Pending</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <CheckCircle size={32} />
              <p>All bookings are handled!</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className={`card ${styles.panel}`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}><AlertTriangle size={18} /> Low Stock Alerts</h2>
            <a href="/admin/inventory" className="btn btn-ghost btn-sm">View All</a>
          </div>
          {inventory && inventory.length > 0 ? (
            <div className={styles.list}>
              {inventory.slice(0, 5).map((item) => (
                <div key={item.id} className={styles.listItem}>
                  <div className={styles.listIcon} style={{ color: 'var(--color-error)', background: 'rgba(239,68,68,0.1)' }}>
                    <Package size={16} />
                  </div>
                  <div className={styles.listInfo}>
                    <div className={styles.listName}>{item.name}</div>
                    <div className={styles.listMeta}>
                      {item.current_quantity} {item.unit} remaining (min: {item.minimum_threshold})
                    </div>
                  </div>
                  <span className="badge badge-error">Low</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <CheckCircle size={32} />
              <p>All items are well-stocked!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
