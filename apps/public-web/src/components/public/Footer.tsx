'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, Mail, MapPin, Clock, Heart } from 'lucide-react';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book Appointment', href: '/book' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Charming Dental Clinic"
              width={240}
              height={64}
              style={{ objectFit: 'contain', width: 'auto', height: '64px' }}
            />
          </div>
          <p className={styles.tagline}>
            Providing world-class dental care with a gentle touch since 2005.
            Your health and comfort are always our top priority.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Quick Links</h4>
          <nav className={styles.links}>
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Contact Us</h4>
          <div className={styles.contactList}>
            <a href="tel:+94 718109283" className={styles.contactItem}>
              <Phone size={16} /> +94 718109283
            </a>
            <a href="https://wa.me/94718109283" target="_blank" rel="noreferrer" className={styles.contactItem}>
              <MessageCircle size={16} /> WhatsApp Us
            </a>
            <a href="mailto:charmingdental@gmail.com" className={styles.contactItem}>
              <Mail size={16} /> charmingdental@gmail.com
            </a>
            <div className={styles.contactItem} style={{ alignItems: 'flex-start' }}>
              <MapPin size={16} style={{ marginTop: '4px', flexShrink: 0 }} /> 
              <span>Charming Dental Clinic<br />97,7 Archbishop Nicholas Marcus Fernando Mawatha, Negombo</span>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Clinic Hours</h4>
          <div className={styles.hours}>
            <div className={styles.hoursRow}>
              <Clock size={14} style={{ flexShrink: 0, marginTop: 4 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className={styles.time}><strong style={{ color: 'var(--color-text-primary)' }}>Mon–Wed:</strong> 9 AM – 1 PM & 5 PM – 11 PM</div>
                <div className={styles.time}><strong style={{ color: 'var(--color-text-primary)' }}>Thu:</strong> 9 AM – 1 PM Only</div>
                <div className={styles.time}><strong style={{ color: 'var(--color-text-primary)' }}>Fri:</strong> 9 AM – 5 PM</div>
                <div className={styles.time}><strong style={{ color: 'var(--color-text-primary)' }}>Sat:</strong> 3:30 PM – 11 PM</div>
                <div className={styles.time}><strong style={{ color: 'var(--color-text-primary)' }}>Sun:</strong> Call in Advance</div>
              </div>
            </div>
            <div className={styles.hoursRow} style={{ marginTop: 8 }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <em>Please Note: We are closed on all Poya (Full Moon) days.</em>
              </div>
            </div>
          </div>

          {/* Map Link */}
          <a 
            href="https://www.google.com/maps/search/?api=1&query=Dental+Clinic+-+Dr+Chaminda+Paris+Negombo"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapPlaceholder}
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            <MapPin size={24} />
            <span>View on Google Maps</span>
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} Charming Dental Clinic. All rights reserved.</p>
          <p className={styles.madeWith}>
            Made with <Heart size={14} className={styles.heart} /> for healthy smiles
          </p>
        </div>
      </div>
    </footer>
  );
}
