import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact Us — Charming Dental Clinic',
  description: 'Get in touch with us for appointments, inquiries, or dental emergencies. We are here to help.',
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>Get in Touch</div>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            We would love to hear from you. Whether you have a question about treatments, pricing, or need to book an appointment.
          </p>
        </header>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 className={styles.infoTitle}>Our Clinic</h3>
              <p className={styles.infoText}>
                123 Smile Boulevard<br />
                Health District, NY 10001
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <Phone size={24} />
            </div>
            <div>
              <h3 className={styles.infoTitle}>Phone & WhatsApp</h3>
              <p className={styles.infoText}>
                +1 (555) 123-4567<br />
                Available 24/7 for emergencies
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <Mail size={24} />
            </div>
            <div>
              <h3 className={styles.infoTitle}>Email</h3>
              <p className={styles.infoText}>
                hello@smiledental.com<br />
                support@smiledental.com
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <Clock size={24} />
            </div>
            <div>
              <h3 className={styles.infoTitle}>Working Hours</h3>
              <p className={styles.infoText}>
                Monday – Friday: 8:00 AM – 8:00 PM<br />
                Saturday: 9:00 AM – 2:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        <div className={styles.mapWrapper}>
          <MapPin size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <div style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Google Maps embed will be configured from the admin dashboard</div>
        </div>
      </div>
    </div>
  );
}
