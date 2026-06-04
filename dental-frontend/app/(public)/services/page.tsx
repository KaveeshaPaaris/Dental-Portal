import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, HeartPulse, Sparkles, Activity, PlusSquare, Stethoscope } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Our Services — Smile Dental Clinic',
  description: 'Comprehensive dental services including general dentistry, orthodontics, teeth whitening, and dental implants.',
};

const SERVICES = [
  {
    id: 'general',
    title: 'General Dentistry',
    icon: Stethoscope,
    description: 'Comprehensive routine care to keep your teeth and gums healthy for a lifetime. We focus on prevention and early detection.',
    features: ['Comprehensive Exams', 'Professional Cleanings', 'Digital X-Rays', 'Oral Cancer Screening'],
  },
  {
    id: 'whitening',
    title: 'Teeth Whitening',
    icon: Sparkles,
    description: 'Professional whitening treatments that safely and effectively brighten your smile by several shades in just one visit.',
    features: ['In-Office Whitening', 'Take-Home Kits', 'Stain Removal', 'Safe for Enamel'],
  },
  {
    id: 'implants',
    title: 'Dental Implants',
    icon: Shield,
    description: 'Permanent, natural-looking tooth replacements that restore full function and aesthetics to your smile.',
    features: ['Single Tooth Replacement', 'Implant-Supported Bridges', 'Full Arch Restoration', 'Bone Grafting'],
  },
  {
    id: 'orthodontics',
    title: 'Orthodontics',
    icon: Activity,
    description: 'Straighten your teeth and correct your bite with modern orthodontic solutions tailored to adults and teens.',
    features: ['Clear Aligners (Invisalign)', 'Traditional Braces', 'Retainers', 'Bite Correction'],
  },
  {
    id: 'root-canal',
    title: 'Root Canal Therapy',
    icon: HeartPulse,
    description: 'Advanced endodontic treatment to save infected or severely decayed teeth, performed with maximum comfort.',
    features: ['Pain-Free Procedure', 'Tooth Preservation', 'Infection Removal', 'Same-Day Relief'],
  },
  {
    id: 'emergency',
    title: 'Emergency Care',
    icon: PlusSquare,
    description: 'Fast, compassionate care for dental emergencies. We prioritize relieving your pain and addressing urgent issues.',
    features: ['Toothache Relief', 'Broken Teeth Repair', 'Lost Crown Replacement', 'Abscess Treatment'],
  },
];

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>Comprehensive Care</div>
          <h1 className={styles.title}>Our Dental Services</h1>
          <p className={styles.subtitle}>
            From routine cleanings to advanced restorative procedures, we offer complete dental care for your entire family under one roof.
          </p>
        </header>

        <div className={styles.grid}>
          {SERVICES.map((service) => (
            <div key={service.id} className={`card ${styles.serviceCard}`}>
              <div className={styles.iconWrapper}>
                <service.icon size={32} />
              </div>
              <h2 className={styles.serviceTitle}>{service.title}</h2>
              <p className={styles.serviceDesc}>{service.description}</p>
              
              <ul className={styles.featuresList}>
                {service.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <CheckCircle2 size={18} className={styles.featureIcon} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Not sure what treatment you need?</h2>
          <p className={styles.ctaDesc}>
            Book a consultation with our expert dentists. We will evaluate your oral health and create a personalized treatment plan.
          </p>
          <Link href="/book" className="btn btn-primary btn-xl">
            Book a Consultation <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
}
