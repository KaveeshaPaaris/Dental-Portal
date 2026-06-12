import type { Metadata } from 'next';
import OtpLoginForm from '@/components/public/OtpLoginForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Patient Login | Charming Dental Clinic',
  description: 'Log in to manage your appointments and view your dental records.',
};

export default function LoginPage() {
  return (
    <div className={styles.page}>
      {/* Animated background blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        <OtpLoginForm />
      </div>

      <p className={styles.footer}>
        By logging in, you agree to our{' '}
        <a href="/privacy" className={styles.link}>Privacy Policy</a>.
      </p>
    </div>
  );
}
