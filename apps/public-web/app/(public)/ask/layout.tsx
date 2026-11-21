import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

// The /ask page is a client component, so its metadata lives in this layout.
export const metadata: Metadata = {
  title: 'Ask a Question',
  description:
    'Get quick answers about treatments, opening hours, location, payments and booking at Charming Dental Clinic, Negombo.',
  alternates: {
    canonical: `${SITE_URL}/ask`,
  },
  openGraph: {
    title: 'Ask a Question — Charming Dental Clinic',
    description:
      'Get quick answers about treatments, opening hours, location, payments and booking at Charming Dental Clinic, Negombo.',
    url: `${SITE_URL}/ask`,
    siteName: 'Charming Dental Clinic',
    type: 'website',
  },
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
