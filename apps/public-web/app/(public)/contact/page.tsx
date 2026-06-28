import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, MessageCircle, Moon } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact Us — Charming Dental Clinic',
  description: 'Get in touch with us for appointments, inquiries, or dental emergencies.',
};

const WORKING_HOURS = [
  { day: 'Monday – Wednesday', time: ['9:00 AM – 1:00 PM', '5:00 PM – 11:00 PM'] },
  { day: 'Thursday', time: ['9:00 AM – 1:00 PM'] },
  { day: 'Friday', time: ['9:00 AM – 5:00 PM'] },
  { day: 'Saturday', time: ['3:30 PM – 11:00 PM'] },
  { day: 'Sunday', time: ['Call in Advance'] },
];

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className="container">

        {/* Header */}
        <header className={styles.header}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>Get in Touch</div>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Have a question or ready to book your visit? Our team is here to provide friendly support and exceptional dental care every step of the way.
          </p>
        </header>

        {/* Address */}
        <a
          href="https://www.google.com/maps/search/?api=1&query=Charming+Dental+Clinic,+Negombo"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.addressCard}
        >
          <div className={styles.iconWrapper}>
            <MapPin size={20} />
          </div>
          <div>
            <h3 className={styles.infoTitle}>Our Clinic</h3>
            <p className={styles.infoText}>
              Charming Dental Clinic<br />
              97,7 Archbishop Nicholas Marcus Fernando Mawatha, Negombo
            </p>
          </div>
        </a>

        {/* Phone · WhatsApp · Email — horizontal */}
        <div className={styles.contactBar}>

          <a href="tel:+94718109283" className={styles.contactItem}>
            <div className={styles.iconWrapper}>
              <Phone size={18} />
            </div>
            <span className={styles.contactLabel}>Phone</span>
            <span className={styles.contactValue}>
              +94 718109283<br />
              <small>+94 312282526</small>
            </span>
          </a>

          <div className={styles.divider} />

          <a
            href="https://wa.me/94718109283"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.contactItem} ${styles.whatsapp}`}
          >
            <div className={`${styles.iconWrapper} ${styles.whatsappIcon}`}>
              <MessageCircle size={18} />
            </div>
            <span className={`${styles.contactLabel} ${styles.whatsappLabel}`}>WhatsApp</span>
            <span className={styles.contactValue}>+94 718109283</span>
          </a>

          <div className={styles.divider} />

          <a href="mailto:charmingdental@gmail.com" className={styles.contactItem}>
            <div className={styles.iconWrapper}>
              <Mail size={18} />
            </div>
            <span className={styles.contactLabel}>Email</span>
            <span className={styles.contactValue}>charmingdental@gmail.com</span>
          </a>

        </div>

        {/* Working Hours */}
        <div className={styles.hoursCard}>
          <div className={styles.hoursHeader}>
            <div className={styles.hoursTitleWrap}>
              <div className={styles.hoursIconWrapper}>
                <Clock size={16} strokeWidth={2.5} />
              </div>
              <h3 className={styles.hoursTitle}>WORKING HOURS</h3>
            </div>
            <div className={styles.closedBadge}>
              <span className={styles.badgeDot}></span> Closed
            </div>
          </div>

          <div className={styles.hoursList}>
            {WORKING_HOURS.map(({ day, time }) => (
              <div key={day} className={styles.hoursRow}>
                <span className={styles.hoursDay}>{day}</span>
                <span className={styles.hoursTime}>
                  {time.map((t, i) => (
                    <span key={i} className={styles.timeLine}>{t}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.poyaFooter}>
            <Moon size={15} /> Closed on all Poya (Full Moon) days
          </div>
        </div>

        {/* Google Map */}
        <div className={styles.mapWrapper}>
          <iframe
            title="Charming Dental Clinic location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4257.295622215056!2d79.84714485929838!3d7.200025464247186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2ef7ab25a6c1b%3A0xc69391f9fb930206!2sDental%20Clinic%20-%20Dr%20Chaminda%20Paris!5e1!3m2!1sen!2slk!4v1782633897788!5m2!1sen!2slk"
            width="100%"
            height="380"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

      </div>
    </div>
  );
}
