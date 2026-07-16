import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import ShareCopyButton from './ShareCopyButton';
import styles from './page.module.css';


// ─── Constants ───────────────────────────────────────────────────────────────
const baseUrl = 'https://charmingdental.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

// ─── Static Pre-rendering (optional, improves performance) ───────────────────
// Pre-renders known blog slugs at build time. New slugs are ISR on-demand.
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/blogs?limit=100`);
    if (!res.ok) return [];
    const data = await res.json();
    const blogs: { slug: string }[] = data.data || [];
    return blogs.map((blog) => ({ slug: blog.slug }));
  } catch {
    return [];
  }
}


// ─── Types ───────────────────────────────────────────────────────────────────
interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string | null;
  author: string | null;
  reading_time: number | null;
  tags: string[];
  published_at: string;
  updated_at?: string;
  meta_description?: string;
  seo_keywords?: string;
}

// ─── Server-side Data Fetchers ────────────────────────────────────────────────
// Uses native fetch() (not the Axios api.ts) so Next.js can:
//   1. Deduplicate identical requests between generateMetadata & BlogDetailPage
//   2. Apply ISR revalidation (next: { revalidate: 300 })

async function getBlogBySlug(slug: string): Promise<BlogDetail | null> {
  try {
    const res = await fetch(`${API_URL}/blogs/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelatedBlogs(currentId: string): Promise<BlogDetail[]> {
  try {
    const res = await fetch(`${API_URL}/blogs?limit=4`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const all: BlogDetail[] = data.data || [];
    return all.filter((b) => b.id !== currentId).slice(0, 3);
  } catch {
    return [];
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
// Next.js deduplicates fetch() calls with identical URL + options, so this
// and BlogDetailPage share a single HTTP round-trip to the backend.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug);

  if (!blog) {
    return { title: 'Blog Article Not Found' };
  }

  const url = `${baseUrl}/blogs/${blog.slug}`;

  return {
    title: `${blog.title} — Dental Health Blog`,
    description: blog.meta_description || blog.excerpt,
    keywords: blog.seo_keywords || 'dental blog, charming dental clinic, oral health',
    alternates: { canonical: url },
    openGraph: {
      title: blog.title,
      description: blog.meta_description || blog.excerpt,
      url,
      siteName: 'Charming Dental Clinic',
      images: blog.cover_image ? [{ url: blog.cover_image, alt: blog.title }] : [],
      type: 'article',
      publishedTime: blog.published_at,
      modifiedTime: blog.updated_at || blog.published_at,
      authors: blog.author ? [blog.author] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.meta_description || blog.excerpt,
      images: blog.cover_image ? [blog.cover_image] : [],
    },
  };
}

// ─── Page (Server Component) ──────────────────────────────────────────────────
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  // Fetch blog + related data on the server — no client waterfall
  const blog = await getBlogBySlug(resolvedParams.slug);
  if (!blog) notFound();

  const related = await getRelatedBlogs(blog.id);

  // Canonical URL constructed server-side — replaces window.location.href
  const canonicalUrl = `${baseUrl}/blogs/${blog.slug}`;

  // ── JSON-LD Structured Data ────────────────────────────────────────────────
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: blog.cover_image ? [blog.cover_image] : [],
    datePublished: blog.published_at,
    dateModified: blog.updated_at || blog.published_at,
    author: {
      '@type': 'Person',
      name: blog.author || 'Charming Dental Clinic',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Charming Dental Clinic',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${baseUrl}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: canonicalUrl },
    ],
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className={styles.page}>
        <div className="container">
          <Link href="/blogs" className={styles.backBtn}>
            <ArrowLeft size={18} /> Back to all articles
          </Link>

          {/* ── Hero Header — server-rendered HTML ── */}
          <header className={styles.header}>
            <span className={styles.category}>{blog.category}</span>
            <h1 className={styles.title}>{blog.title}</h1>
            <div className={styles.meta}>
              <div className={styles.authorBlock}>
                <div className={styles.authorAvatar}>
                  {(blog.author || 'A')[0].toUpperCase()}
                </div>
                <span>{blog.author || 'Admin'}</span>
              </div>
              <div className={styles.metaDivider} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} /> {formatDate(blog.published_at)}
              </span>
              {blog.reading_time && (
                <>
                  <div className={styles.metaDivider} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} /> {blog.reading_time} min read
                  </span>
                </>
              )}
            </div>
          </header>

          {/* ── Cover Image — server-rendered HTML ── */}
          {blog.cover_image && (
            <div className={styles.imageWrapper}>
              <Image
                src={blog.cover_image}
                alt={blog.title}
                fill
                className={styles.image}
                priority
                sizes="(max-width: 1200px) 100vw, 1000px"
              />
            </div>
          )}

          {/* ── Main Layout ── */}
          <div className={styles.mainLayout}>
            {/* Article Body — server-rendered HTML (the critical SEO win) */}
            <article
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              {/* Share section */}
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>Share this article</h3>
                <div className={styles.socialRow}>
                  {/* Static <a> share links — server-rendered, use canonical URL */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.socialBtn}
                    aria-label="Share on Facebook"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(blog.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.socialBtn}
                    aria-label="Share on Twitter"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(blog.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.socialBtn}
                    aria-label="Share on LinkedIn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                  {/* Only the Copy Link button is a client island */}
                  <ShareCopyButton url={canonicalUrl} />
                </div>
              </div>

              {/* Tags — server-rendered */}
              {blog.tags && blog.tags.length > 0 && (
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>Tags</h3>
                  <div className={styles.tags}>
                    {blog.tags.map((t) => (
                      <span key={t} className={styles.tag}>#{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA — server-rendered */}
              <div className={styles.ctaCard}>
                <h3>Ready for a brighter smile?</h3>
                <p>Book your consultation with our expert dental team today.</p>
                <Link href="/book" className={styles.ctaBtn}>
                  Book Appointment
                </Link>
              </div>
            </aside>
          </div>

          {/* ── Related Articles — server-rendered HTML ── */}
          {related.length > 0 && (
            <section className={styles.relatedSection}>
              <h2 className={styles.relatedTitle}>You might also like</h2>
              <div className={styles.relatedGrid}>
                {related.map((rel) => (
                  <Link
                    href={`/blogs/${rel.slug}`}
                    key={rel.id}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedImg}>
                      {rel.cover_image ? (
                        <Image
                          src={rel.cover_image}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>
                    <div className={styles.relatedContent}>
                      <h3 className={styles.relatedPostTitle}>{rel.title}</h3>
                      <p className={styles.relatedExcerpt}>{rel.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
