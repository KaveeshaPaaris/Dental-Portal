import type { Metadata } from 'next';
import Link from 'next/link';
// [FIX #5] Removed unused `CheckCircle` import
// [FIX #9] Added Lucide icons to replace service emojis
import { ArrowRight, Star, Shield, Clock, Heart, Stethoscope, Sparkles, Wrench, AlignCenter, Crown, HeartPulse } from 'lucide-react';
import styles from './page.module.css';
import ReviewsCarousel from '@/components/ReviewsCarousel';

export const metadata: Metadata = {
  title: 'Charming Dental Clinic — World-Class Dental Care',
  description:
    'Book your dental appointment online. Expert care for all your dental needs — teeth whitening, orthodontics, implants, and more.',
};

const FEATURES = [
  { icon: Shield, title: 'Expert Doctors', desc: 'Board-certified specialists with 15+ years of experience.' },
  { icon: Clock, title: 'Flexible Hours', desc: 'Morning and evening sessions to fit your schedule.' },
  { icon: Heart, title: 'Gentle Care', desc: 'Patient-first approach in a comfortable environment.' },
  { icon: Star, title: '5-Star Rated', desc: 'Hundreds of happy patients trust us with their smiles.' },
];

// [FIX #9] Replaced emojis with Lucide icons for a professional medical look
const SERVICES = [
  { icon: Stethoscope, name: 'General Dentistry', desc: 'Cleanings, fillings, extractions, and preventive care.' },
  { icon: Sparkles, name: 'Teeth Whitening', desc: 'Professional-grade whitening for a brighter smile.' },
  { icon: Wrench, name: 'Dental Implants', desc: 'Permanent, natural-looking replacements.' },
  { icon: AlignCenter, name: 'Orthodontics', desc: 'Braces and clear aligners for perfectly aligned teeth.' },
  { icon: Crown, name: 'Dental Crowns', desc: 'Restore damaged teeth with ceramic crowns.' },
  { icon: HeartPulse, name: 'Root Canal Therapy', desc: 'Pain-free treatment to save infected teeth.' },
];

export default function HomePage() {
  return (
    <div>

      {/* ─── Hero ─────────────────────────────────────────── */}
      {/* [FIX #14] Added aria-label for landmark navigation */}
      <section className={styles.hero} aria-label="Hero - Welcome">
        <div className={styles.heroBg} />
        <div className="container">
          {/* [FIX #1] heroContent now has a frosted glass overlay for readability */}
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              World-Class Dental Care,{' '}
              <span className={styles.heroHighlight}>Close to Home</span>
            </h1>

            <div className={styles.heroActions}>
              <Link href="/book" className="btn btn-primary btn-xl">
                Book Appointment <ArrowRight size={18} />
              </Link>
              <Link href="/services" className="btn btn-secondary btn-xl">
                Our Services
              </Link>
            </div>

            {/* [FIX #3] Stats section with a subtle separator/backdrop for contrast */}
            <div className={styles.heroStatsWrapper}>
              <div className={styles.heroStats}>
                {[
                  { value: '15+', label: 'Years Experience' },
                  { value: '5K+', label: 'Happy Patients' },
                  { value: '4.9', label: 'Star Rating' },
                ].map((stat) => (
                  // [FIX #13] Added aria-label for screen readers
                  <div
                    key={stat.label}
                    className={styles.stat}
                    aria-label={`${stat.value} ${stat.label}`}
                  >
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      {/* [FIX #14] Added aria-label for landmark navigation */}
      <section className={styles.features} aria-label="Why Choose Us">
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
      {/* [FIX #14] Added aria-label for landmark navigation */}
      <section className={styles.services} aria-label="Our Services">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Our Services</h2>
            <p>Comprehensive dental care for your entire family</p>
          </div>
          <div className={styles.servicesGrid}>
            {/* [FIX #8] Wrapped service cards in <Link> to make them proper links */}
            {SERVICES.map((s) => (
              <Link key={s.name} href="/services" className={`card ${styles.serviceCard}`}>
                {/* [FIX #9] Using Lucide icon styled identically to featureIcon */}
                <div className={styles.featureIcon} style={{ margin: '0 0 8px 0' }}>
                  <s.icon size={22} />
                </div>
                <h3 className={styles.serviceName}>{s.name}</h3>
                <p className={styles.serviceDesc}>{s.desc}</p>
              </Link>
            ))}
          </div>
          <div className={styles.servicesCTA}>
            <Link href="/services" className="btn btn-secondary btn-lg">
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Reviews Carousel ──────────────────────────────── */}
      <ReviewsCarousel />

      {/* ─── CTA Banner ───────────────────────────────────── */}
      {/* [FIX #14] Added aria-label for landmark navigation */}
      <section className={styles.ctaBanner} aria-label="Book an Appointment">
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Ready for a Healthier Smile?</h2>
            <p>Book your appointment today — morning and evening slots available.</p>
            {/* [FIX #4] Changed misleading CTA from "Book Now — It's Free" */}
            <Link href="/book" className="btn btn-accent btn-xl">
              Schedule Your Appointment <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
