import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield } from 'lucide-react';
import styles from './page.module.css';
import ReviewsCarousel from '@/components/ReviewsCarousel';
import { getFeaturedServices } from '@/data/services';
import { FadeUp, StaggerContainer, ParallaxHeroBg, SlideIn, FloatAnimation, RevealOnScroll } from '@/components/animations';
import { AnimatedServiceLink } from '@/components/animations/AnimatedCards';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { Review } from '@/components/ReviewsCarousel';

function HeroStats({ className }: { className?: string }) {
  return (
    <div className={`${styles.heroStatsWrapper} ${className || ''}`}>
      <div className={styles.heroStats}>
        {[
          { value: '25+', label: 'Years Experience' },
          { value: '5K+', label: 'Happy Patients' },
          { value: '4.9', label: 'Star Rating' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={styles.stat}
            aria-label={`${stat.value} ${stat.label}`}
          >
            <div className={styles.statValue}>
              <AnimatedCounter
                value={parseFloat(stat.value.replace(/[^\d.]/g, ''))}
                suffix={stat.value.replace(/[\d.]/g, '')}
              />
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

async function getFeaturedReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${API_URL}/reviews/featured`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Charming Dental Clinic — World-Class Dental Care',
  description:
    'Book your dental appointment online. Expert care for all your dental needs — teeth whitening, orthodontics, implants, and more.',
  alternates: {
    canonical: 'https://charmingdental.com',
  },
};

const PILLARS = [
  {
    id: 'flexible-hours',
    title: 'We work around your day',
    points: [
      'Morning & evening slots available',
      'Book online, anytime',
      'Same-week appointments on request',
    ],
  },
  {
    id: 'gentle-care',
    title: 'Kind care for every age',
    points: [
      'Gentle treatment for kids & adults',
      'Calm, unhurried environment',
      'No rush, no judgment — ever',
    ],
  },
  {
    id: 'sterilization',
    title: 'Clean tools. Every single time.',
    points: [
      'Hospital-grade sterilization',
      'Strict protocols before & after every procedure',
      'Your safety is never a trade-off',
    ],
  },
];

// ─── Skeleton fallbacks ────────────────────────────────────────────────────

/** Skeleton shown while services data is loading */
function ServicesSkeleton() {
  return (
    <section className={styles.services} aria-label="Our Services" aria-busy="true">
      <div className="container">
        <div className={styles.sectionHeader}>
          <div style={{ height: '2rem', width: '12rem', background: 'var(--color-skeleton, #e5e7eb)', borderRadius: 8, marginBottom: '0.5rem' }} />
          <div style={{ height: '1rem', width: '20rem', background: 'var(--color-skeleton, #e5e7eb)', borderRadius: 6 }} />
        </div>
        <div className={styles.servicesGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`card ${styles.serviceCard}`}
              style={{ background: 'var(--color-skeleton, #e5e7eb)', minHeight: 260, borderRadius: 12 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Skeleton shown while reviews data is loading */
function ReviewsSkeleton() {
  return (
    <section aria-label="Patient Reviews" aria-busy="true" style={{ padding: '4rem 0' }}>
      <div className="container">
        <div style={{ height: '2rem', width: '14rem', background: 'var(--color-skeleton, #e5e7eb)', borderRadius: 8, margin: '0 auto 2rem' }} />
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{ flex: '0 0 280px', height: 160, background: 'var(--color-skeleton, #e5e7eb)', borderRadius: 12 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Async child Server Components ────────────────────────────────────────

/** Fetches + renders the featured services grid. Runs concurrently with ReviewsSection. */
async function ServicesSection() {
  const FEATURED_SERVICES = await getFeaturedServices();
  return (
    <section className={styles.services} aria-label="Our Services">
      <div className="container">
        <FadeUp>
          <div className={styles.sectionHeader}>
            <h2>Our Services</h2>
            <p>Comprehensive dental care for your entire family</p>
          </div>
        </FadeUp>
        <StaggerContainer className={styles.servicesGrid}>
          {FEATURED_SERVICES.map((s) => (
            <AnimatedServiceLink key={s.slug} href={`/services/${s.slug}`} className={`card ${styles.serviceCard}`}>
              <div className={styles.serviceCardImgWrap}>
                <Image
                  src={s.image}
                  alt={`${s.title} treatment at Charming Dental Clinic, Negombo`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                  className={styles.serviceCardImg}
                />
              </div>
              <div className={styles.serviceCardBody}>
                <h3 className={styles.serviceName}>{s.title}</h3>
                <p className={styles.serviceDesc}>{s.shortDesc}</p>
                <span className={styles.learnMore} aria-hidden="true">
                  Learn More <ArrowRight size={13} />
                </span>
              </div>
            </AnimatedServiceLink>
          ))}
        </StaggerContainer>
        <FadeUp delay={0.3}>
          <div className={styles.servicesCTA}>
            <Link href="/services" className="btn btn-secondary btn-lg">
              View All Services <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/** Fetches + renders the reviews carousel. Runs concurrently with ServicesSection. */
async function ReviewsSection() {
  const reviews = await getFeaturedReviews();
  // [FIX #15] Passed reviews directly, removing client-side fetch and Suspense skeleton
  return <ReviewsCarousel reviews={reviews} />;
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const clinicSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: 'Charming Dental Clinic',
    image: 'https://charmingdental.com/about-clinic-v2.jpg',
    '@id': 'https://charmingdental.com',
    url: 'https://charmingdental.com',
    telephone: '+94718109283',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '97,7 Archbishop Nicholas Marcus Fernando Mawatha',
      addressLocality: 'Negombo',
      addressCountry: 'LK'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 7.2000254,
      longitude: 79.8471448
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday'],
        opens: '09:00',
        closes: '13:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday'],
        opens: '17:00',
        closes: '23:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Thursday',
        opens: '09:00',
        closes: '13:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Friday',
        opens: '09:00',
        closes: '17:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '15:30',
        closes: '23:00'
      }
    ]
  };

  return (
    // [FIX #16] Wrapped content in <main> for correct landmark semantics
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
      />

      {/* [FIX #17] Skip navigation link for keyboard / screen-reader users */}
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>

      {/* ─── Hero ─────────────────────────────────────────── */}
      {/* [FIX #14] Added aria-label for landmark navigation */}
      <section className={styles.hero} aria-label="Hero - Welcome">
        <ParallaxHeroBg className={styles.heroBg} aria-hidden="true">
          <Image
            src="/hero-bg.webp"
            alt="Dental clinic background"
            fill
            priority
            className={`${styles.heroImage} ${styles.heroImageDesktop}`}
          />
          <Image
            src="/dental_clinic_interior_portrait.webp"
            alt="Dental clinic interior portrait"
            fill
            priority
            className={`${styles.heroImage} ${styles.heroImageMobile}`}
          />
        </ParallaxHeroBg>
        <div className="container">
          {/* [FIX #1] heroContent sits cleanly over the hero image */}
          <div className={styles.heroContent}>
            <div className={styles.desktopOnly}>
              <FadeUp delay={0}>
                <h1 className={styles.heroTitle}>
                  Where Excellence Meets{' '}
                  <span className={styles.heroHighlight}>Every Smile</span>
                </h1>
              </FadeUp>
              <FadeUp delay={0.15}>
                <p className={styles.heroSubtext}>
                  Trusted by 5,000+ patients. Board-certified specialists, same-week appointments available.
                </p>
              </FadeUp>
            </div>

            <div className={styles.mobileOnly}>
              <FadeUp delay={0}>
                <h1 className={styles.heroTitle}>
                  Where <span className={styles.heroHighlight}>Excellence</span> Meets{' '}
                  <span className={styles.heroHighlight}>Every Smile.</span>
                </h1>
              </FadeUp>
              <FadeUp delay={0.15}>
                <p className={styles.heroSubtext}>
                  Your path to a brighter, healthier smile starts here.
                </p>
              </FadeUp>
            </div>

            <div className={styles.heroActions}>
              <FadeUp delay={0.3}>
                <Link href="/book" className="btn btn-primary btn-xl">
                  Book Appointment <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </FadeUp>
              <FadeUp delay={0.42} className={styles.hideOnMobile}>
                <Link href="/services" className="btn btn-secondary btn-xl">
                  Our Services
                </Link>
              </FadeUp>
            </div>

            {/* [FIX #3] Stats section with a subtle separator/backdrop for contrast */}
            <HeroStats className={styles.desktopOnlyStats} />
          </div>
        </div>
      </section>

      {/* Mobile Stats placed between Hero and Services */}
      <div className={`container ${styles.mobileOnlyStatsContainer}`}>
        <HeroStats className={styles.mobileOnlyStats} />
      </div>

      {/* ─── Why Choose Us (3-Pillar Strip) ─────────────────── */}
      <section className={styles.pillars} aria-label="Why Choose Us">
        <div className={`container ${styles.pillarsInner}`}>
          {PILLARS.map((pillar, i) => (
            <FadeUp key={pillar.id} delay={i * 0.12} className={styles.pillar}>
              <h2 className={styles.pillarTitle}>{pillar.title}</h2>
              <ul className={styles.pillarList}>
                {pillar.points.map((pt) => (
                  <li key={pt} className={styles.pillarPoint}>{pt}</li>
                ))}
              </ul>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ─── Services — streams in while hero is already visible ── */}
      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesSection />
      </Suspense>

      {/* ─── Meet the Doctor ──────────────────────────────── */}
      <section className={styles.doctorSection} aria-label="Meet the Doctor">
        <div className="container">
          <div className={styles.doctorGrid}>

            {/* Left Column: Image */}
            <SlideIn direction="left" delay={0} className={styles.doctorImageCol}>
              <FloatAnimation className={styles.doctorImageWrapper}>
                <Image
                  src="/doctor_croped.jpg"
                  alt="Dr. Chaaminda Paaris — Expert dentist at Charming Dental Clinic, Negombo"
                  fill
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
                  <span className={styles.expNumber}>25+</span>
                  <span className={styles.expText}>Years of<br/>Experience</span>
                </div>
              </FadeUp>

            </div>

          </div>
        </div>
      </section>

      {/* ─── Reviews — streams in independently of Services ─── */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection />
      </Suspense>

      {/* ─── CTA Banner ───────────────────────────────────── */}
      {/* [FIX #14] Added aria-label for landmark navigation */}
      <section className={styles.ctaBanner} aria-label="Book an Appointment">
        <div className="container">
          <RevealOnScroll className={styles.ctaContent}>
            <h2>Ready for a Healthier Smile?</h2>
            <p>Book your appointment today — morning and evening slots available.</p>
            {/* [FIX #4] Changed misleading CTA from "Book Now — It's Free" */}
            <Link href="/book" className="btn btn-accent btn-xl">
              Schedule Your Appointment <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  );
}
