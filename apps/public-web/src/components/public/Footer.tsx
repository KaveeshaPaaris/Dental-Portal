import Link from 'next/link';
import Image from 'next/image';
import {
  Phone, MessageCircle, Mail, MapPin, Clock, Heart, ChevronRight,
} from 'lucide-react';
// Social icons as inline SVGs
const IconFacebook = (props: any) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path></svg>
);
const IconInstagram = (props: any) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg>
);
const IconWhatsapp = (props: any) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.6c-33.3 0-66-8.9-94.6-25.8l-6.8-4-70.1 18.4 18.7-68.3-4.4-7C47.7 298.5 38.3 261.6 38.3 224c0-102.5 83.5-185.9 185.9-185.9 49.6 0 96.2 19.3 131.3 54.4 35.1 35.1 54.4 81.7 54.4 131.3 0 102.5-83.5 186-185.9 186zm101.8-139c-5.6-2.8-33-16.3-38.1-18.2-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18.2-17.6 21.8-3.2 3.7-6.5 4.2-12.1 1.4-5.6-2.8-23.5-8.7-44.8-27.7-16.5-14.8-27.6-33.1-30.9-38.6-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.6-6.5 8.4-9.8 2.8-3.2 3.7-5.6 5.6-9.3 1.9-3.7.9-7-5-12.1-2.8-5.6-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.5-.2-10.2-.2-3.7 0-9.8 1.4-14.9 6.9-5.1 5.6-19.5 19-19.5 46.4s20 53.8 22.8 57.5c2.8 3.7 39.1 59.7 94.7 83.8 13.2 5.7 23.5 9.1 31.5 11.6 13.2 4.2 25.2 3.6 34.8 2.2 10.7-1.5 33-13.4 37.6-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
);
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
  { icon: IconFacebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: IconInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: IconWhatsapp, href: 'https://wa.me/94718109283', label: 'WhatsApp' },
];

const HOURS = [
  { day: 'Mon – Wed', times: ['9 AM – 1 PM', '5 PM – 11 PM'] },
  { day: 'Thursday', times: ['9 AM – 1 PM'] },
  { day: 'Friday', times: ['9 AM – 5 PM'] },
  { day: 'Saturday', times: ['3:30 PM – 11 PM'] },
  { day: 'Sunday', times: ['Call in Advance'] },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>

        {/* ── Col 1: Brand ─────────────────────── */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Charming Dental Clinic — Dental Clinic in Negombo, Sri Lanka"
              width={250}
              height={110}
              className={styles.logoLight}
              style={{ objectFit: 'contain', objectPosition: 'left', width: 'auto', height: '110px' }}
            />
            <Image
              src="/logo_dark.png"
              alt=""
              width={250}
              height={110}
              className={styles.logoDark}
              style={{ objectFit: 'contain', objectPosition: 'left', width: 'auto', height: '110px' }}
              aria-hidden="true"
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
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={styles.socialIcon}
                aria-label={label}
                title={label}
              >
                <Icon size={15} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Col 2: Quick Links ───────────────── */}
        <div className={`${styles.col} ${styles.quickLinksCol}`}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <nav aria-label="Footer navigation">
            {QUICK_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className={styles.navLink}>
                <ChevronRight size={12} className={styles.chevron} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Col 3: Contact ───────────────────── */}
        <div className={styles.col}>
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
        </div>

        {/* ── Col 4: Clinic Hours ──────────────── */}
        <div className={styles.col}>
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
        </div>

      </div>

      {/* ── Bottom bar ───────────────────────── */}
      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} Charming Dental Clinic. All rights reserved.</p>
          <p className={styles.madeWith}>
            Made with <Heart size={12} className={styles.heart} aria-hidden="true" /> for healthy smiles
          </p>
        </div>
      </div>
    </footer>
  );
}
