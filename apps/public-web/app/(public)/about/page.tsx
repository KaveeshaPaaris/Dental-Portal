import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About Us — Smile Dental Clinic',
  description: 'Learn about our mission, our history, and meet the expert team of dentists dedicated to your oral health.',
};

const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Chief Orthodontist',
    bio: 'With over 15 years of experience, Dr. Jenkins specializes in Invisalign and complex bite corrections.',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600&h=800',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Implant Specialist',
    bio: 'Dr. Chen is a board-certified oral surgeon focusing on dental implants and full-arch restorations.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600&h=800',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatric Dentist',
    bio: 'Dedicated to making children’s dental visits fun and stress-free. Dr. Rodriguez is beloved by our youngest patients.',
    imageUrl: 'https://images.unsplash.com/photo-1594824432258-f75f9227f32e?auto=format&fit=crop&q=80&w=600&h=800',
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>Our Story</div>
          <h1 className={styles.title}>Dedicated to Your Smile</h1>
          <p className={styles.subtitle}>
            Since 2010, Smile Dental Clinic has been providing world-class dental care to our community. 
            We combine advanced technology with a compassionate, patient-first approach.
          </p>
        </header>

        <section className={styles.missionSection}>
          <div className={styles.missionImage}>
            <Image
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200&h=800"
              alt="Modern Dental Clinic"
              fill
              className="object-cover"
              sizes="(max-width: 992px) 100vw, 50vw"
            />
          </div>
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

        <section className={styles.teamSection}>
          <div className={styles.teamHeader}>
            <div className="badge badge-accent" style={{ marginBottom: 16 }}>Our Experts</div>
            <h2>Meet the Team</h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              Our board-certified dentists and specialists are here to provide you with the highest standard of care.
            </p>
          </div>

          <div className={styles.teamGrid}>
            {DOCTORS.map((doc) => (
              <div key={doc.id} className={styles.doctorCard}>
                <div className={styles.doctorImageWrapper}>
                  <Image
                    src={doc.imageUrl}
                    alt={doc.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>{doc.name}</h3>
                  <div className={styles.doctorSpecialty}>{doc.specialty}</div>
                  <p className={styles.doctorBio}>{doc.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
