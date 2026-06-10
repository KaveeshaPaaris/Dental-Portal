'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Calendar, Star, Package,
  HelpCircle, FileText, Users, Settings, LogOut,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/admin/dashboard',      icon: LayoutDashboard },
  { label: 'Bookings',    href: '/admin/bookings',        icon: Calendar },
  { label: 'Schedule',    href: '/admin/bookings/schedule', icon: Calendar },
  { label: 'Reviews',     href: '/admin/reviews',         icon: Star },
  { label: 'Inventory',   href: '/admin/inventory',       icon: Package },
  { label: 'FAQs',        href: '/admin/faqs',            icon: HelpCircle },
  { label: 'Content',     href: '/admin/content',         icon: FileText },
];

const SUPER_ADMIN_ITEMS = [
  { label: 'Manage Admins', href: '/admin/manage-admins', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (href: string) =>
    href === '/admin/dashboard'
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <aside className={`admin-sidebar ${styles.sidebar}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <Image src="/logo.png" alt="Charming Dental Clinic" width={32} height={32} className={styles.logoIcon} style={{ objectFit: 'contain' }} />
        <div>
          <div className={styles.logoMain}>Charming Dental Clinic</div>
          <div className={styles.logoRole}>{user?.role?.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <span className={styles.navLabel}>Menu</span>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${isActive(href) ? styles.active : ''}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>

        {user?.role === 'SUPER_ADMIN' && (
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Super Admin</span>
            {SUPER_ADMIN_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navItem} ${isActive(href) ? styles.active : ''}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.full_name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{user?.full_name}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button onClick={signOut} className={`btn btn-ghost btn-sm ${styles.logoutBtn}`}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
