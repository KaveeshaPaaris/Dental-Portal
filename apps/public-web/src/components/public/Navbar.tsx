'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { Sun, Moon, Menu, X, Phone, User, LogOut } from 'lucide-react';
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
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                <Link href="/login" className="btn btn-secondary btn-sm">
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
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </SpotlightCard>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/book" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
            Book Appointment
          </Link>
        </div>
      )}
    </header>
  );
}
