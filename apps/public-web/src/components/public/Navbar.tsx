'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { Sun, Moon, Menu, X, Phone, User, LogOut, ChevronRight } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'About Us', href: '/about' },
  { label: 'Contacts', href: '/contact' },
  { label: 'Ask Questions', href: '/ask' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = usePatientAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close drawer with exit animation
  const closeDrawer = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
    }, 220);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    if (menuOpen) closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) closeDrawer();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen, closeDrawer]);

  const openDrawer = () => setMenuOpen(true);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.nav}>
        {/* Logo */}
        <SpotlightCard className={`${styles.logoBox} ${styles.glassBox}`} spotlightColor="rgba(0, 22, 70, 0.25)">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', height: '100%', textDecoration: 'none' }}>
            <Image
              src="/logo.png"
              alt="Charming Dental Clinic logo — Dentist in Negombo"
              width={240}
              height={64}
              sizes="140px"
              style={{ objectFit: 'contain', width: '140px', height: '140px' }}
              className={styles.logoLight}
              priority
            />
            <Image
              src="/logo_dark.png"
              alt="Charming Dental Clinic logo — Dentist in Negombo"
              width={240}
              height={64}
              sizes="140px"
              style={{ objectFit: 'contain', width: '140px', height: '140px' }}
              className={styles.logoDark}
              priority
            />
          </Link>
        </SpotlightCard>

        {/* Desktop Nav & Actions */}
        <SpotlightCard className={`${styles.navBox} ${styles.glassBox}`} spotlightColor="rgba(0, 22, 70, 0.25)">
          <nav className={styles.desktopNav}>
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={toggleTheme}
              className={`btn btn-ghost btn-sm ${styles.themeBtn}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <Link href="/book" className="btn btn-primary">
                  <Phone size={16} />
                  Book Appointment
                </Link>
                <button
                  onClick={signOut}
                  className={`btn btn-ghost btn-sm ${styles.themeBtn}`}
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary btn-sm" style={{ display: 'none' }}>
                  <User size={15} />
                  Patient Login
                </Link>
                <Link href="/book" className="btn btn-primary">
                  <Phone size={16} />
                  Book Appointment
                </Link>
              </>
            )}

            <button
              className={`btn btn-ghost btn-sm ${styles.menuBtn}`}
              onClick={openDrawer}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <Menu size={32} />
            </button>
          </div>
        </SpotlightCard>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      {menuOpen && (
        <>
          {/* Overlay — tap to close */}
          <div
            className={styles.drawerOverlay}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            id="mobile-drawer"
            className={`${styles.drawer} ${closing ? styles.drawerClosing : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div className={styles.drawerHeader}>
              <Link href="/" onClick={closeDrawer} style={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src={theme === 'dark' ? '/logo_dark.png' : '/logo.png'}
                  alt="Charming Dental Clinic"
                  width={120}
                  height={40}
                  style={{ objectFit: 'contain', width: 'auto', height: '40px' }}
                  priority
                />
              </Link>
              <button
                className={styles.drawerCloseBtn}
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className={styles.drawerNav} aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`}
                    onClick={closeDrawer}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                    <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.4 }} aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer — CTA + theme toggle */}
            <div className={styles.drawerFooter}>
              <Link
                href="/book"
                className={styles.drawerBookBtn}
                onClick={closeDrawer}
              >
                <Phone size={18} aria-hidden="true" />
                Book Appointment
              </Link>

              {user ? (
                <button
                  onClick={() => { signOut(); closeDrawer(); }}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-secondary"
                  onClick={closeDrawer}
                  style={{ display: 'none', width: '100%', justifyContent: 'center' }}
                >
                  <User size={16} />
                  Patient Login
                </Link>
              )}

              <div className={styles.drawerThemeRow}>
                <span className={styles.drawerThemeLabel}>
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </span>
                <button
                  onClick={toggleTheme}
                  className="btn btn-ghost btn-sm"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
