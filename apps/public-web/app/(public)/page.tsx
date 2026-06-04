import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Clock, Heart, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Smile Dental Clinic — World-Class Dental Care',
  description:
    'Book your dental appointment online. Expert care for all your dental needs — teeth whitening, orthodontics, implants, and more.',
};

const FEATURES = [
  { icon: Shield, title: 'Expert Doctors', desc: 'Board-certified specialists with 15+ years of experience.' },
  { icon: Clock,  title: 'Flexible Hours', desc: 'Morning and evening sessions to fit your schedule.' },
  { icon: Heart,  title: 'Gentle Care',   desc: 'Patient-first approach in a comfortable environment.' },
  { icon: Star,   title: '5-Star Rated',  desc: 'Hundreds of happy patients trust us with their smiles.' },
];

const SERVICES = [
  { emoji: '🦷', name: 'General Dentistry',  desc: 'Cleanings, fillings, extractions, and preventive care.' },
  { emoji: '✨', name: 'Teeth Whitening',    desc: 'Professional-grade whitening for a brighter smile.' },
  { emoji: '🔧', name: 'Dental Implants',    desc: 'Permanent, natural-looking replacements.' },
  { emoji: '🌀', name: 'Orthodontics',       desc: 'Braces and clear aligners for perfectly aligned teeth.' },
  { emoji: '👑', name: 'Dental Crowns',      desc: 'Restore damaged teeth with ceramic crowns.' },
  { emoji: '😌', name: 'Root Canal Therapy', desc: 'Pain-free treatment to save infected teeth.' },
];

export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className="container">
          <div className={styles.heroContent}>
            <div className={`badge badge-accent ${styles.heroBadge}`}>
              <CheckCircle size={12} />
              Accepting New Patients
            </div>
            <h1 className={styles.heroTitle}>
              World-Class Dental Care,{' '}
              <span className={styles.heroHighlight}>Close to Home</span>
            </h1>
            <p className={styles.heroSubtext}>
              Experience exceptional dental treatment in a warm, welcoming environment.
              Our expert team is dedicated to your comfort and confidence.
            </p>
            <div className={styles.heroActions}>
              <Link href="/book" className="btn btn-primary btn-xl">
                Book Appointment <ArrowRight size={18} />
              </Link>
              <Link href="/services" className="btn btn-secondary btn-xl">
                Our Services
              </Link>
            </div>
            <div className={styles.heroStats}>
              {[
                { value: '15+', label: 'Years Experience' },
                { value: '5K+', label: 'Happy Patients' },
                { value: '4.9', label: 'Star Rating' },
              ].map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`card ${styles.featureCard}`}>
                <div className={styles.featureIcon}>
                  <Icon size={22} />
                </div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─────────────────────────────────────── */}
      <section className={styles.services}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Our Services</h2>
            <p>Comprehensive dental care for your entire family</p>
          </div>
          <div className={styles.servicesGrid}>
            {SERVICES.map((s) => (
              <div key={s.name} className={`card ${styles.serviceCard}`}>
                <span className={styles.serviceEmoji}>{s.emoji}</span>
                <h3 className={styles.serviceName}>{s.name}</h3>
                <p className={styles.serviceDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className={styles.servicesCTA}>
            <Link href="/services" className="btn btn-secondary btn-lg">
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Ready for a Healthier Smile?</h2>
            <p>Book your appointment today — morning and evening slots available.</p>
            <Link href="/book" className="btn btn-accent btn-xl">
              Book Now — It's Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
