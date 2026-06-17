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

        <div className={styles.mapWrapper} style={{ padding: 0, overflow: 'hidden' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7916.714284488204!2d79.84456997365503!3d7.200030814934783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2ef7ab25a6c1b%3A0xc69391f9fb930206!2sDental%20Clinic%20-%20Dr%20Chaminda%20Paris!5e0!3m2!1sen!2slk!4v1781615194606!5m2!1sen!2slk"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '400px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
