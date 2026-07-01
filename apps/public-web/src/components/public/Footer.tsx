'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Phone, MessageCircle, Mail, MapPin, Clock, Heart, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { VIEWPORT_CONFIG, staggerContainer, fadeUpVariant, DURATIONS, EASE_OUT } from '@/utils/animations';
import { useTheme } from '@/context/ThemeContext';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book Appointment', href: '/book' },
];

const SOCIAL = [
  { icon: FaFacebookF, href: 'https://facebook.com', label: 'Facebook' },
  { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: FaWhatsapp, href: 'https://wa.me/94718109283', label: 'WhatsApp' },
];

const HOURS = [
  { day: 'Mon – Wed', times: ['9 AM – 1 PM', '5 PM – 11 PM'] },
  { day: 'Thursday', times: ['9 AM – 1 PM'] },
  { day: 'Friday', times: ['9 AM – 5 PM'] },
  { day: 'Saturday', times: ['3:30 PM – 11 PM'] },
  { day: 'Sunday', times: ['Call in Advance'] },
];

export default function Footer() {
  const { theme } = useTheme();

  return (
    <motion.footer
      className={styles.footer}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={staggerContainer}
    >
      <div className={`container ${styles.grid}`}>

        {/* ── Col 1: Brand ─────────────────────── */}
        <motion.div variants={fadeUpVariant} className={styles.brand}>
          <div className={styles.logo}>
            <Image
              src={theme === 'dark' ? '/logo_dark.png' : '/logo.png'}
              alt="Charming Dental Clinic"
              width={250}
              height={110}
              style={{ objectFit: 'contain', objectPosition: 'left', width: 'auto', height: '110px' }}
            />
          </div>
          <p className={styles.tagline}>
            Creating confident smiles through compassionate, modern dental care in Negombo.
          </p>
          <p className={styles.trustBadge}>
            Trusted family dental care in Negombo since 2006.
          </p>
          <div className={styles.socials} aria-label="Social media links">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={styles.socialIcon}
                aria-label={label}
                title={label}
                whileHover={{ scale: 1.1, y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={15} aria-hidden="true" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* ── Col 2: Quick Links ───────────────── */}
        <motion.div variants={fadeUpVariant} className={styles.col}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <nav aria-label="Footer navigation">
            {QUICK_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className={styles.navLink}>
                <ChevronRight size={12} className={styles.chevron} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </motion.div>

        {/* ── Col 3: Contact ───────────────────── */}
        <motion.div variants={fadeUpVariant} className={styles.col}>
          <h4 className={styles.colTitle}>Contact</h4>
          <div className={styles.contactList}>
            <a href="tel:+94718109283" className={styles.contactRow}>
              <Phone size={15} aria-hidden="true" />
              <span>+94 71 810 9283</span>
            </a>
            <a href="mailto:charmingdental@gmail.com" className={styles.contactRow}>
              <Mail size={15} aria-hidden="true" />
              <span>charmingdental@gmail.com</span>
            </a>
            <div className={styles.contactRow} style={{ alignItems: 'flex-start' }}>
              <MapPin size={15} style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
              <span>97/7 Archbishop Nicholas Marcus Fernando Mawatha, Negombo</span>
            </div>
            <a
              href="https://wa.me/94718109283"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactRow}
            >
              <MessageCircle size={15} aria-hidden="true" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </motion.div>

        {/* ── Col 4: Clinic Hours ──────────────── */}
        <motion.div variants={fadeUpVariant} className={styles.col}>
          <h4 className={styles.colTitle}>Clinic Hours</h4>
          <div className={styles.hoursList}>
            {HOURS.map(({ day, times }) => (
              <div key={day} className={styles.hourItem}>
                <span className={styles.hourDay}>{day}</span>
                {times.map((t) => (
                  <span key={t} className={styles.hourTime}>{t}</span>
                ))}
              </div>
            ))}
          </div>
          <p className={styles.poyaNote}>
            <Clock size={12} aria-hidden="true" />
            Closed on all Poya (Full Moon) days.
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Dental+Clinic+-+Dr+Chaminda+Paris+Negombo"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapBtn}
          >
            <MapPin size={13} aria-hidden="true" />
            View on Google Maps
          </a>
        </motion.div>

      </div>

      {/* ── Bottom bar ───────────────────────── */}
      <motion.div variants={fadeUpVariant} className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} Charming Dental Clinic. All rights reserved.</p>
          <p className={styles.madeWith}>
            Made with <Heart size={12} className={styles.heart} aria-hidden="true" /> for healthy smiles
          </p>
        </div>
      </motion.div>
    </motion.footer>
  );
}
