import { Metadata } from 'next';
import BookingForm from '@/components/public/BookingForm';
import BookingHeader from '@/components/public/BookingHeader';
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
        <BookingHeader currentStep={1} />
        <div className={styles.formWrap}>
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
