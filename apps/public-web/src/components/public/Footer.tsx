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
            <a href="tel:+15550000000" className={styles.contactItem}>
              <Phone size={16} /> +1 (555) 000-0000
            </a>
            <a href="https://wa.me/15550000000" target="_blank" rel="noreferrer" className={styles.contactItem}>
              <MessageCircle size={16} /> WhatsApp Us
            </a>
            <a href="mailto:hello@smileclinic.com" className={styles.contactItem}>
              <Mail size={16} /> hello@smileclinic.com
            </a>
            <div className={styles.contactItem}>
              <MapPin size={16} /> 123 Main Street, City
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Clinic Hours</h4>
          <div className={styles.hours}>
            <div className={styles.hoursRow}>
              <Clock size={14} />
              <div>
                <div className={styles.session}>Morning Session</div>
                <div className={styles.time}>9:00 AM – 1:00 PM</div>
              </div>
            </div>
            <div className={styles.hoursRow}>
              <Clock size={14} />
              <div>
                <div className={styles.session}>Evening Session</div>
                <div className={styles.time}>5:00 PM – 9:00 PM</div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className={styles.mapPlaceholder}>
            <MapPin size={24} />
            <span>View on Google Maps</span>
          </div>
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
