import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Submit Your Review — Charming Dental Clinic',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
