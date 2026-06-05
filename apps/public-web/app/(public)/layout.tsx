import type { Metadata } from 'next';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FABButtons from '@/components/public/FABButtons';

export const metadata: Metadata = {
  title: { template: '%s | Charming Dental Clinic', default: 'Charming Dental Clinic' },
  description: 'World-class dental care, close to home.',
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '72px' }}>
        {children}
      </main>
      <Footer />
      <FABButtons />
    </>
  );
}
