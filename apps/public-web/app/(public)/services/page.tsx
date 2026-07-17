import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getServices } from '@/data/services';
import ExpandableServiceGrid from '@/components/public/ExpandableServiceGrid';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Our Dental Services — Charming Dental Clinic',
  description:
    'Explore our full range of dental services in Negombo — teeth whitening, orthodontics, implants, scaling & polishing, and more. Book your appointment today.',
  keywords:
    'dental services, teeth whitening, orthodontics, dental implants, scaling polishing, Negombo dentist, Charming Dental Clinic',
  alternates: {
    canonical: 'https://charmingdental.com/services',
  },
  openGraph: {
    title: 'Our Dental Services — Charming Dental Clinic',
    description:
      'Comprehensive dental care for your entire family — from routine check-ups to advanced restorative procedures.',
    url: 'https://charmingdental.com/services',
    siteName: 'Charming Dental Clinic',
    type: 'website',
  },
};

export default async function ServicesPage() {
  const SERVICES = await getServices();

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Comprehensive Dental Care</p>
          <h1 className={styles.heroTitle}>Our Dental Services</h1>
          <p className={styles.heroSub}>
            From routine check-ups to advanced restorative procedures — expert care for your
            entire family under one roof.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>14+</strong><span>Treatments Available</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>5K+</strong><span>Patients Treated</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>25+</strong><span>Years of Excellence</span></div>
          </div>
        </div>
      </section>



      <section className={styles.gridSection} aria-label="Services list">
        <div className="container">
          <ExpandableServiceGrid services={SERVICES.map(s => ({
            slug: s.slug,
            title: s.title,
            image: s.image,
            listingDesc: s.listingDesc,
            highlights: s.highlights
          }))} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className={styles.cta} aria-label="Book a consultation">
        <div className="container">
          <div className={styles.ctaBox}>
            <h2>Not sure which treatment you need?</h2>
            <p>
              Book a consultation and our specialists will assess your oral health and recommend
              the ideal treatment plan for you.
            </p>
            <Link href="/book" className="btn btn-primary btn-xl">
              Book a Consultation <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
