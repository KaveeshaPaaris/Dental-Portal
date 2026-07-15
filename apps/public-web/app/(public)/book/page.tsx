import { Metadata } from 'next';
import Image from 'next/image';
import BookingForm from '@/components/public/BookingForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Book an Appointment | Charming Dental Clinic',
  description: 'Book your dental appointment online at Charming Dental Clinic, Negombo. Quick, easy, and secure booking process.',
  alternates: {
    canonical: 'https://charmingdental.com/book',
  },
  openGraph: {
    title: 'Book an Appointment | Charming Dental Clinic',
    description: 'Book your dental appointment online at Charming Dental Clinic, Negombo. Quick, easy, and secure booking process.',
    url: 'https://charmingdental.com/book',
    siteName: 'Charming Dental Clinic',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book an Appointment | Charming Dental Clinic',
    description: 'Book your dental appointment online at Charming Dental Clinic, Negombo. Quick, easy, and secure booking process.',
  },
};

export default function BookAppointmentPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: 'Charming Dental Clinic',
    description: 'Dental clinic offering various treatments including checkups, whitening, and implants.',
    url: 'https://charmingdentalclinic.com',
    telephone: '+94771234567',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Negombo',
      addressCountry: 'LK'
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://charmingdentalclinic.com/book',
        inLanguage: 'en-US',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform'
        ]
      },
      result: {
        '@type': 'MedicalAppointment'
      }
    }
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container">
        <div className={styles.layout}>
          {/* Left: Photo Card */}
          <div className={styles.photoCard}>
            <Image
              src="/clinic-interior .webp"
              alt="Interior of Charming Dental Clinic, Negombo — Book a dental appointment"
              className={styles.clinicImage}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              priority={true}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.photoOverlay}>
              <h1 className={styles.photoTitle}>Book Your<br />Appointment</h1>
              <p className={styles.photoSubtitle}>
                Fill in the form and we'll send a verification code to your phone to confirm your booking.
              </p>
            </div>
          </div>

          {/* Right: Form Component */}
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
