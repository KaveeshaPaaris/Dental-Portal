'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Link as LinkIcon, Check } from 'lucide-react';
import api from '@/lib/api';
import styles from './page.module.css';

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
}

export default function ClientBlogDetail({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [related, setRelated] = useState<BlogDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current blog
        const res = await api.get(`/blogs/${slug}`);
        setBlog(res.data);
        
        // Fetch related blogs (just grab latest 4 and filter out current)
        const relRes = await api.get('/blogs?limit=4');
        const allLatest = relRes.data.data || [];
        setRelated(allLatest.filter((b: BlogDetail) => b.id !== res.data.id).slice(0, 3));
        
      } catch (err: any) {
        console.error('Failed to fetch blog post', err);
        if (err.response?.status === 404) {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="skeleton" style={{ height: 40, width: 200, marginBottom: 24 }}></div>
          <div className="skeleton" style={{ height: 80, marginBottom: 48 }}></div>
          <div className="skeleton" style={{ height: 500, borderRadius: 'var(--radius-xl)', marginBottom: 48 }}></div>
          <div className="skeleton" style={{ height: 20, marginBottom: 16 }}></div>
          <div className="skeleton" style={{ height: 20, width: '80%' }}></div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/blogs" className={styles.backBtn}>
          <ArrowLeft size={18} /> Back to all articles
        </Link>

        {/* ── HERO HEADER ── */}
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

        {/* ── COVER IMAGE ── */}
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

        {/* ── MAIN LAYOUT (Content + Sidebar) ── */}
        <div className={styles.mainLayout}>
          
          {/* ARTICLE CONTENT */}
          <article 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            {/* Share */}
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Share this article</h3>
              <div className={styles.socialRow}>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noreferrer" className={styles.socialBtn} aria-label="Share on Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noreferrer" className={styles.socialBtn} aria-label="Share on Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(blog.title)}`} target="_blank" rel="noreferrer" className={styles.socialBtn} aria-label="Share on LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <button onClick={copyLink} className={styles.socialBtn} aria-label="Copy link">
                  {copied ? <Check size={18} /> : <LinkIcon size={18} />}
                </button>
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>Tags</h3>
                <div className={styles.tags}>
                  {blog.tags.map(t => (
                    <span key={t} className={styles.tag}>#{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className={styles.ctaCard}>
              <h3>Ready for a brighter smile?</h3>
              <p>Book your consultation with our expert dental team today.</p>
              <Link href="/book" className={styles.ctaBtn}>
                Book Appointment
              </Link>
            </div>
          </aside>
        </div>

        {/* ── RELATED ARTICLES ── */}
        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>You might also like</h2>
            <div className={styles.relatedGrid}>
              {related.map(rel => (
                <Link href={`/blogs/${rel.slug}`} key={rel.id} className={styles.relatedCard}>
                  <div className={styles.relatedImg}>
                    {rel.cover_image ? (
                      <Image
                        src={rel.cover_image}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
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
  );
}
