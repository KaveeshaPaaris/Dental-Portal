'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, CheckCircle2 } from 'lucide-react';
import { SERVICES, CATEGORIES } from '@/data/services';
import type { ServiceCategory } from '@/data/services';
import styles from './page.module.css';

type FilterCategory = 'All' | ServiceCategory;

export default function ServicesPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All');

  const filtered = useMemo(() => {
    return SERVICES.filter((s) => {
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      const matchesSearch =
        query.trim() === '' ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.listingDesc.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [query, activeCategory]);

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Comprehensive Dental Care</p>
          <h1 className={styles.heroTitle}>Our Dental Services</h1>
          <p className={styles.heroSub}>
            From routine check-ups to advanced restorative procedures — expert care for your
            entire family under one roof.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>14+</strong><span>Treatments Available</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>5K+</strong><span>Patients Treated</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>20+</strong><span>Years of Excellence</span></div>
          </div>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────── */}
      <div className={styles.filtersBar}>
        <div className={`container ${styles.filtersInner}`}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search treatments…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search dental services"
            />
          </div>
          <div className={styles.chips} role="group" aria-label="Filter by category">
            {(['All', ...CATEGORIES] as FilterCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ''}`}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────── */}
      <section className={styles.gridSection} aria-label="Services list">
        <div className="container">
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>
                No services match your search.{' '}
                <button
                  onClick={() => { setQuery(''); setActiveCategory('All'); }}
                  className={styles.resetBtn}
                >
                  Reset filters
                </button>
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className={styles.card}
                  aria-label={`Learn more about ${s.title}`}
                >
                  {/* Photo */}
                  <div className={styles.cardImgWrap}>
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.cardImg}
                    />
                    <span className={styles.categoryBadge}>{s.category}</span>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{s.title}</h2>
                    <p className={styles.cardDesc}>{s.listingDesc}</p>
                    <ul className={styles.highlights} aria-label={`Key features of ${s.title}`}>
                      {s.highlights.map((h) => (
                        <li key={h} className={styles.highlight}>
                          <CheckCircle2 size={14} aria-hidden="true" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    <span className={styles.cardCta} aria-hidden="true">
                      Learn More <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className={styles.cta} aria-label="Book a consultation">
        <div className="container">
          <div className={styles.ctaBox}>
            <h2>Not sure which treatment you need?</h2>
            <p>
              Book a consultation and our specialists will assess your oral health and recommend
              the ideal treatment plan for you.
            </p>
            <Link href="/book" className="btn btn-primary btn-xl">
              Book a Consultation <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
