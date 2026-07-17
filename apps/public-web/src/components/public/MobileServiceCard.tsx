'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../../app/(public)/services/page.module.css';

interface ServiceProp {
  slug: string;
  title: string;
  image: string;
  listingDesc: string;
  highlights: string[];
}

export default function MobileServiceCard({ service }: { service: ServiceProp }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ borderRadius: 28 }}
      className={styles.mobileCardInner}
    >
      <div className={styles.cardImgWrap}>
        <img
          src={encodeURI(service.image)}
          alt={`${service.title} — dental service`}
          className={styles.cardImg}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <motion.div layout="position" className={styles.cardBody}>
        <motion.h2 layout="position" className={styles.cardTitle}>{service.title}</motion.h2>
        
        <motion.p 
          layout="position" 
          className={`${styles.cardDesc} ${!isExpanded ? styles.cardDescClamped : ''}`}
        >
          {service.listingDesc}
        </motion.p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={styles.expandedContent}
            >
              <ul className={styles.highlights}>
                {service.highlights.map((h) => (
                  <li key={h} className={styles.highlight}>
                    <CheckCircle2 size={14} aria-hidden="true" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              
              <div className={styles.cardActionsRow}>
                <Link href={`/book`} className={`btn btn-primary ${styles.btnFull}`}>
                  Book Now
                </Link>
                <Link href={`/services/${service.slug}`} className={`btn btn-secondary ${styles.btnFull}`}>
                  Read Full Details <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
           <motion.button 
             layout="position"
             onClick={() => setIsExpanded(true)} 
             className={styles.cardCta}
             aria-expanded={isExpanded}
           >
             View Details <ChevronDown size={16} style={{ marginLeft: 6, marginTop: 2 }} />
           </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
