import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
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

        <div className={styles.contentWrapper}>
          <div>
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
              <div style={{ position: 'absolute', fontWeight: 600 }}>Interactive Map Placeholder</div>
            </div>
          </div>

          <div>
            <form className={styles.contactForm}>
              <h2 className={styles.formTitle}>Send us a Message</h2>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" htmlFor="name">Full Name</label>
                <input type="text" id="name" className="form-input" placeholder="John Doe" />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <input type="email" id="email" className="form-input" placeholder="john@example.com" />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" htmlFor="subject">Subject</label>
                <select id="subject" className="form-input">
                  <option value="general">General Inquiry</option>
                  <option value="appointment">Appointment Reschedule</option>
                  <option value="billing">Billing Question</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="form-label" htmlFor="message">Message</label>
                <textarea id="message" className="form-input" rows={5} placeholder="How can we help you?"></textarea>
              </div>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }}>
                Send Message <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
