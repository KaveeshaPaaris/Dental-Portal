import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { ALLOW_INDEXING, SITE_URL } from '@/lib/site';

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

// Runs before first paint: picks the saved theme (or the device's preference) so there is no flash.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('dental-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export const metadata: Metadata = {
  // Lets relative URLs (e.g. the social preview image) resolve to absolute ones.
  metadataBase: new URL(SITE_URL),
  title: 'Charming Dental Clinic',
  description: 'World-class dental care, close to home. Book your appointment today.',
  keywords: 'dental clinic, dentist, teeth, orthodontics, dental care',
  // Hidden from search engines until ALLOW_INDEXING=true (see src/lib/site.ts).
  ...(ALLOW_INDEXING ? {} : { robots: { index: false, follow: false } }),
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <ReactQueryProvider>
            {children}
            <Toaster
              position="top-right"
              // Push messages down so they appear below the navbar, not over it
              containerStyle={{ top: 96 }}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
