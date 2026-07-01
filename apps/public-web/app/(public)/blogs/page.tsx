import type { Metadata } from 'next';
import ClientBlogList from './ClientBlogList';

const title = 'Dental Health Blog — Charming Dental Clinic';
const description = 'Expert insights, tips, and news to help you maintain a healthy, beautiful smile. Read our latest articles on oral hygiene, treatments, and more.';
const url = 'https://charmingdental.com/blogs'; // Assuming base URL

export const metadata: Metadata = {
  title,
  description,
  keywords: 'dental blog, oral health tips, dentist blog, charming dental clinic, tooth care, smile',
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: 'Charming Dental Clinic',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function BlogsPage() {
  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://charmingdental.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blogs',
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ClientBlogList />
    </>
  );
}
