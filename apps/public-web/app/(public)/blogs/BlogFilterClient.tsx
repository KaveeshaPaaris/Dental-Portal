'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import styles from './page.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  author: string | null;
  reading_time: number | null;
  published_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6;

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * BlogFilterClient — receives allBlogs from the Server Component parent.
 * No fetch calls inside. Manages only: search state, category filter, pagination.
 * The server-rendered header (<h1>, description) lives in blogs/page.tsx above this.
 */
export default function BlogFilterClient({ allBlogs }: { allBlogs: Blog[] }) {
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  // Derive unique category list from the full blog array
  const categories = useMemo(() => {
    const cats = new Set(allBlogs.map((b) => b.category));
    return ['All', ...Array.from(cats)].sort();
  }, [allBlogs]);

  // Filter blogs by active category
  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((b) => {
      return category === 'All' || b.category === category;
    });
  }, [allBlogs, category]);

  // In the default (no-filter) view the first blog is the featured hero
  const isDefaultView = category === 'All';
  const featuredBlog =
    isDefaultView && filteredBlogs.length > 0 ? filteredBlogs[0] : null;

  // The remaining blogs go into the paginated grid
  const gridBlogs = featuredBlog ? filteredBlogs.slice(1) : filteredBlogs;
  const totalPages = Math.ceil(gridBlogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedBlogs = gridBlogs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Reset to page 1 whenever category changes
  useEffect(() => {
    setPage(1);
  }, [category]);

  return (
    <>
      {/* ── Controls: Category Filter ── */}
      <div className={styles.controls}>
        {categories.length > 1 && (
          <div className={styles.categories}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`${styles.categoryBtn} ${
                  category === c ? styles.categoryBtnActive : ''
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content Area ── */}
      {filteredBlogs.length === 0 ? (
        // Empty state when no blogs match the current filters
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface-2)',
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--color-text-muted)',
            }}
          >
            <div style={{ fontSize: '28px' }}>📂</div>
          </div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: 8,
              color: 'var(--color-text-primary)',
            }}
          >
            No articles found
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
            We couldn&apos;t find any articles matching your current filters.
          </p>
          <button
            onClick={() => {
              setCategory('All');
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* ── Featured Card (first blog, default view, page 1 only) ── */}
          {featuredBlog && page === 1 && (
            <Link
              href={`/blogs/${featuredBlog.slug}`}
              className={styles.featuredCard}
              style={{ display: 'block' }}
            >
              <article style={{ display: 'grid', gridTemplateColumns: 'inherit', height: '100%' }}>
                <div className={styles.featuredImageWrapper}>
                  {featuredBlog.cover_image ? (
                    <Image
                      src={featuredBlog.cover_image}
                      alt={featuredBlog.title}
                      fill
                      className={styles.image}
                      sizes="(max-width: 992px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>
                <div className={styles.featuredContent}>
                  <div className={styles.meta} style={{ marginBottom: 16 }}>
                    <span className={styles.category}>{featuredBlog.category}</span>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} /> {formatDate(featuredBlog.published_at)}
                      </span>
                      {featuredBlog.reading_time && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} /> {featuredBlog.reading_time} min read
                        </span>
                      )}
                    </div>
                  </div>
                  <h2 className={styles.featuredTitle}>{featuredBlog.title}</h2>
                  <p className={styles.featuredExcerpt}>{featuredBlog.excerpt}</p>
                  <div className={styles.cardFooter} style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className={styles.author}>
                      <div className={styles.authorAvatar}>
                        {(featuredBlog.author || 'A')[0].toUpperCase()}
                      </div>
                      {featuredBlog.author || 'Admin'}
                    </div>
                    <span className={styles.readMore}>
                      Read Article <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* ── Blog Grid ── */}
          <div className={styles.grid}>
            {paginatedBlogs.map((blog) => (
              <Link
                href={`/blogs/${blog.slug}`}
                key={blog.id}
                className={styles.card}
                style={{ display: 'block' }}
              >
                <article style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </div>
                  <div className={styles.content}>
                    <div className={styles.meta}>
                      <span className={styles.category}>{blog.category}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} /> {formatDate(blog.published_at)}
                      </span>
                    </div>
                    <h2 className={styles.postTitle}>{blog.title}</h2>
                    <p className={styles.excerpt}>{blog.excerpt}</p>
                    <div className={styles.cardFooter}>
                      <div className={styles.author} style={{ fontSize: '0.8125rem' }}>
                        <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                        {blog.author || 'Admin'}
                      </div>
                      <span className={styles.readMore}>
                        Read <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                >
                  {p}
                </button>
              ))}

              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
