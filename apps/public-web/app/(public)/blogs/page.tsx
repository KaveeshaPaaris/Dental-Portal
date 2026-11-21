import type { Metadata } from 'next';
import styles from './page.module.css';
import BlogFilterClient from './BlogFilterClient';
import type { Blog } from './BlogFilterClient';
import { apiFetch } from '@/lib/apiFetch';

// ─── Constants ────────────────────────────────────────────────────────────────
const title = 'Dental Health Blog';
const socialTitle = 'Dental Health Blog — Charming Dental Clinic';
const description =
  'Expert insights, tips, and news to help you maintain a healthy, beautiful smile. Read our latest articles on oral hygiene, treatments, and more.';
const url = 'https://charmingdental.com/blogs';

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title,
  description,
  keywords: 'dental blog, oral health tips, dentist blog, charming dental clinic, tooth care, smile',
  alternates: {
    canonical: url,
  },
  openGraph: {
    title: socialTitle,
    description,
    url,
    siteName: 'Charming Dental Clinic',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description,
  },
};

// ─── Server-side Data Fetcher ─────────────────────────────────────────────────
async function getAllBlogs(): Promise<Blog[]> {
  // ISR — revalidate every 5 minutes; throws on API failure so the last good page is kept
  const data = await apiFetch<{ data?: Blog[] }>('/blogs?limit=100', 300);
  return data?.data || [];
}

// ─── Page (async Server Component) ───────────────────────────────────────────
export default async function BlogsPage() {
  // Fetch all blogs on the server — no client waterfall, no loading skeleton
  const allBlogs = await getAllBlogs();

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

      <div className={styles.page}>
        <div className="container">
          {/* Server-rendered page header — always present in initial HTML for crawlers */}
          <header className={styles.header}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>
              Latest Updates
            </div>
            <h1 className={styles.title}>Dental Health Blog</h1>
            <p className={styles.subtitle}>
              Expert insights, tips, and news to help you maintain a healthy, beautiful smile.
            </p>
          </header>

          {/*
           * Client island — receives the full blog list as a prop.
           * Contains: search input, category filter, featured card, grid, pagination.
           * No fetch() calls inside — all data comes from the server above.
           */}
          <BlogFilterClient allBlogs={allBlogs} />
        </div>
      </div>
    </>
  );
}
