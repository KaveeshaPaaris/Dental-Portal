'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Menu, X, Phone } from 'lucide-react';
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
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🦷</span>
          <span className={styles.logoText}>
            <span className={styles.logoMain}>Smile</span>
            <span className={styles.logoSub}>Dental</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
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

          <Link href="/book" className="btn btn-primary">
            <Phone size={16} />
            Book Appointment
          </Link>

          <button
            className={`btn btn-ghost btn-sm ${styles.menuBtn}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/book" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
            Book Appointment
          </Link>
        </div>
      )}
    </header>
  );
}
