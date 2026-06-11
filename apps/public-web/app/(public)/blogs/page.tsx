'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import api from '@/lib/api';
import styles from './page.module.css';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  published_at: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get('/blogs');
        setBlogs(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch blogs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>Latest Updates</div>
          <h1 className={styles.title}>Dental Health Blog</h1>
          <p className={styles.subtitle}>
            Expert insights, tips, and news to help you maintain a healthy, beautiful smile.
          </p>
        </header>

        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }}></div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)' }}>
            <p>No blog posts published yet. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {blogs.map((blog) => (
              <article key={blog.id} className={`card ${styles.card}`}>
                <div className={styles.imageWrapper}>
                  {blog.cover_image ? (
                    <Image
                      src={blog.cover_image}
                      alt={blog.title}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                      No Image
                    </div>
                  )}
                </div>
                <div className={styles.content}>
                  <div className={styles.meta}>
                    <span className={styles.category}>{blog.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} /> {formatDate(blog.published_at)}
                    </span>
                  </div>
                  <h2 className={styles.postTitle}>{blog.title}</h2>
                  <p className={styles.excerpt}>{blog.excerpt}</p>
                  <Link href={`/blogs/${blog.slug}`} className={styles.readMore}>
                    Read Article <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
