import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import styles from './page.module.css';
import MapSection from '@/components/public/MapSection';

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
                Charming Dental Clinic <br />
                97,7 Archbishop Nicholas Marcus Fernando Mawatha, Negombo
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
                +94 718109283<br />
                +94 312282526

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
                charmingdental@gmail.com<br />
                supcomport@charmingdental.
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
                Mon–Wed: 9 AM–1 PM & 5 PM–11 PM<br />
                Thu: 9 AM–1 PM Only<br />
                Fri: 9 AM–5 PM <br />
                Sat: 3:30 PM–11 PM<br />
                Sun: Call in Advance for Appointments<br />

                We are closed on all Poya (Full Moon) days.
              </p>
            </div>
          </div>
        </div>

        <MapSection />
      </div>
    </div>
  );
}
