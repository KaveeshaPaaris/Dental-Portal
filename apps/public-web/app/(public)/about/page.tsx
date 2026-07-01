import type { Metadata } from 'next';
import Image from 'next/image';
import { Shield } from 'lucide-react';
import { FadeUp, SlideIn, FloatAnimation, RevealOnScroll } from '@/components/animations';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About Us — Charming Dental Clinic',
  description: 'Learn about our mission, our history, and meet the expert team of dentists dedicated to your oral health.',
};

const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Chaaminda Paaris',
    specialty: 'Chief Dentist',
    bio: 'Delivering trusted dental care with over two decades of experience',
    imageUrl: '/doctor_croped.jpg',
  },

];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>Our Story</div>
          <h1 className={styles.title}>Dedicated to Your Smile</h1>
          <p className={styles.subTitle}>
            Since 2010, Charming Dental Clinic has been providing world-class dental care to our community.
            We combine advanced technology with a compassionate, patient-first approach.
          </p>
        </header>

        <div className={styles.clinicImageContainer}>
          <Image
            src="/about-clinic-v2.jpg"
            alt="Charming Dental Clinic Exterior"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 1000px) 100vw, 1000px"
            priority
          />
        </div>

        <section className={styles.missionSection}>

          <div className={styles.missionContent}>
            <h2>Our Mission</h2>
            <p>
              We believe that everyone deserves a healthy, beautiful smile. Our mission is to provide
              exceptional dental care in a comfortable, anxiety-free environment.
            </p>
            <p>
              We invest in the latest dental technologies and continuous education to ensure our patients
              receive the most effective, minimally invasive treatments available today.
            </p>

            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>15+</div>
                <div className={styles.statLabel}>Years of Excellence</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>10k+</div>
                <div className={styles.statLabel}>Happy Patients</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>12</div>
                <div className={styles.statLabel}>Expert Specialists</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.teamSection} aria-label="Meet the Doctor">
          <div className={styles.doctorGrid}>
            
            {/* Left Column: Image */}
            <SlideIn direction="left" delay={0} className={styles.doctorImageCol}>
              <div className={styles.doctorAbstractShape} />
              <FloatAnimation className={styles.doctorImageWrapper}>
                <Image
                  src="/doctor_croped.jpg"
                  alt="Dr. Chaaminda Paaris"
                  fill
                  unoptimized={true}
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  sizes="(max-width: 992px) 100vw, 45vw"
                />
              </FloatAnimation>
            </SlideIn>

            {/* Right Column: Content */}
            <div className={styles.doctorContentCol}>
              <FadeUp delay={0.1}>
                <span className={styles.doctorLabel}>MEET THE DOCTOR</span>
              </FadeUp>
              
              <FadeUp delay={0.2}>
                <h2 className={styles.doctorName}>Dr. Chaaminda Paaris</h2>
                <div className={styles.doctorSpecialty}>Chief Dentist</div>
              </FadeUp>

              <FadeUp delay={0.35}>
                <div className={styles.doctorQualifications}>
                  BDS (University of Peradeniya)<br/>
                  DHDP (University of Colombo)
                </div>
              </FadeUp>

              <RevealOnScroll delay={0.5} className={styles.doctorRegBadge}>
                <Shield className={styles.doctorRegIcon} size={18} />
                <span>SLMC Registration No. 1634</span>
              </RevealOnScroll>

              <FadeUp delay={0.5}>
                <p className={styles.doctorBio}>
                  Delivering trusted, ethical and patient-focused dental care with over two decades of clinical experience, combining modern dentistry with a gentle and compassionate approach.
                </p>
              </FadeUp>

              <FadeUp delay={0.65}>
                <div className={styles.doctorExpBadge}>
                  <span className={styles.expNumber}>20+</span>
                  <span className={styles.expText}>Years of<br/>Experience</span>
                </div>
              </FadeUp>
            </div>
            
          </div>
        </section>
      </div>
    </div>
  );
}
