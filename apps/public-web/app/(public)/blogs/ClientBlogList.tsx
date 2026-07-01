'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Search, ChevronLeft, ChevronRight, User } from 'lucide-react';
import api from '@/lib/api';
import styles from './page.module.css';

interface Blog {
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

const ITEMS_PER_PAGE = 6;

export default function ClientBlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Fetch up to 100 published blogs to allow client-side search & filter
        const res = await api.get('/blogs?limit=100');
        setBlogs(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch blogs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(blogs.map(b => b.category));
    return ['All', ...Array.from(cats)].sort();
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const matchCat = category === 'All' || b.category === category;
      const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [blogs, category, search]);

  // If no filters are active and we have blogs, the first one is featured.
  const isDefaultView = search === '' && category === 'All';
  const featuredBlog = isDefaultView && filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  
  // The rest of the blogs to display in the grid
  const gridBlogs = featuredBlog ? filteredBlogs.slice(1) : filteredBlogs;

  // Pagination logic
  const totalPages = Math.ceil(gridBlogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedBlogs = gridBlogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category]);

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
        
        {/* Header */}
        <header className={styles.header}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>Latest Updates</div>
          <h1 className={styles.title}>Dental Health Blog</h1>
          <p className={styles.subtitle}>
            Expert insights, tips, and news to help you maintain a healthy, beautiful smile.
          </p>
        </header>

        {/* Controls: Search & Category Filter */}
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Search articles..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          {categories.length > 1 && (
            <div className={styles.categories}>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`${styles.categoryBtn} ${category === c ? styles.categoryBtnActive : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          // Loading Skeleton
          <>
            {isDefaultView && <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)', marginBottom: 48 }}></div>}
            <div className={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton" style={{ height: 420, borderRadius: 'var(--radius-lg)' }}></div>
              ))}
            </div>
          </>
        ) : filteredBlogs.length === 0 ? (
          // Empty State
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
            <div style={{ background: 'var(--color-surface-2)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--color-text-muted)' }}>
              <Search size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>No articles found</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              We couldn't find any articles matching your current filters.
            </p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {featuredBlog && page === 1 && (
              <Link href={`/blogs/${featuredBlog.slug}`} className={styles.featuredCard} style={{ display: 'block' }}>
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
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                      No Image
                    </div>
                  )}
                </div>
                <div className={styles.featuredContent}>
                  <div className={styles.meta} style={{ marginBottom: 16 }}>
                    <span className={styles.category}>{featuredBlog.category}</span>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> {formatDate(featuredBlog.published_at)}</span>
                      {featuredBlog.reading_time && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {featuredBlog.reading_time} min read</span>}
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

            <div className={styles.grid}>
              {paginatedBlogs.map((blog) => (
                <Link href={`/blogs/${blog.slug}`} key={blog.id} className={styles.card} style={{ display: 'block' }}>
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
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageBtn} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
