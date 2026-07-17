'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import MobileServiceCard from '@/components/public/MobileServiceCard';
import styles from '../../../app/(public)/services/page.module.css';

export default function ExpandableServiceGrid({ services }: { services: any[] }) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.grid}>
        {services.map((s, index) => {
          const isHiddenOnMobile = !mobileExpanded && index >= 6;
          
          return (
            <div 
              key={s.slug} 
              className={`${styles.cardContainer} ${isHiddenOnMobile ? styles.hideOnMobile : ''}`}
            >
              {/* Desktop Version */}
              <Link
                href={`/services/${s.slug}`}
                className={`${styles.card} ${styles.desktopOnly}`}
                aria-label={`Learn more about ${s.title}`}
              >
                {/* Photo */}
                <div className={styles.cardImgWrap}>
                  <Image
                    src={s.image}
                    alt={`${s.title} — dental service in Negombo, Sri Lanka`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.cardImg}
                  />
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{s.title}</h2>
                  <p className={styles.cardDesc}>{s.listingDesc}</p>
                  <ul className={styles.highlights} aria-label={`Key features of ${s.title}`}>
                    {s.highlights.map((h: string) => (
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
              
              {/* Mobile Expandable Version */}
              <div className={styles.mobileOnly}>
                <MobileServiceCard service={{
                  slug: s.slug,
                  title: s.title,
                  image: s.image,
                  listingDesc: s.listingDesc,
                  highlights: s.highlights
                }} />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Mobile CTA to expand remaining services */}
      {!mobileExpanded && services.length > 6 && (
        <div className={styles.mobileExpandCta}>
          <div className={styles.mobileExpandBox}>
            <h3>Looking for another treatment?</h3>
            <p>We offer a comprehensive range of specialized dental services.</p>
            <button 
              onClick={() => setMobileExpanded(true)} 
              className="btn btn-primary btn-xl"
              style={{ width: '100%', marginTop: '16px' }}
            >
              View All Services <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
