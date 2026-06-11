'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
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
  published_at: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blogs/${resolvedParams.slug}`);
        setBlog(res.data);
      } catch (err: any) {
        console.error('Failed to fetch blog post', err);
        if (err.response?.status === 404) {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="skeleton" style={{ height: 40, width: 200, marginBottom: 24 }}></div>
          <div className="skeleton" style={{ height: 80, marginBottom: 48 }}></div>
          <div className="skeleton" style={{ height: 500, borderRadius: 'var(--radius-xl)', marginBottom: 48 }}></div>
          <div className="skeleton" style={{ height: 20, marginBottom: 16 }}></div>
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

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/blogs" className={styles.backBtn}>
          <ArrowLeft size={18} /> Back to all articles
        </Link>

        <header className={styles.header}>
          <span className={styles.category}>{blog.category}</span>
          <h1 className={styles.title}>{blog.title}</h1>
          <div className={styles.meta}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} /> {formatDate(blog.published_at)}
            </span>
          </div>
        </header>

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

        {/* 
          In a real production app, you might want to use a Markdown parser 
          or DOM sanitizer here. Since the admin inputs this text, we can use 
          white-space: pre-wrap or dangerouslySetInnerHTML.
        */}
        <div 
          className={styles.content}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {blog.content}
        </div>
      </div>
    </div>
  );
}
