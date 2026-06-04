import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

export const metadata: Metadata = {
  title: 'Smile Dental Clinic',
  description: 'World-class dental care, close to home. Book your appointment today.',
  keywords: 'dental clinic, dentist, teeth, orthodontics, dental care',
  openGraph: {
    title: 'Smile Dental Clinic',
    description: 'World-class dental care, close to home.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var saved = localStorage.getItem('dental-theme');
                var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', saved || preferred);
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
