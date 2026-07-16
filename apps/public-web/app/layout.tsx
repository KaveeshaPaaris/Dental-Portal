import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { PatientAuthProvider } from '@/context/PatientAuthContext';
import { Toaster } from 'react-hot-toast';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Charming Dental Clinic',
  description: 'World-class dental care, close to home. Book your appointment today.',
  keywords: 'dental clinic, dentist, teeth, orthodontics, dental care',
  openGraph: {
    title: 'Charming Dental Clinic',
    description: 'World-class dental care, close to home.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Charming Dental Clinic',
    description: 'World-class dental care, close to home.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#e8f0fb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <PatientAuthProvider>
          <ReactQueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                },
              }}
            />
          </ReactQueryProvider>
          </PatientAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
