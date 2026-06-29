'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { VIEWPORT_CONFIG, fadeUpVariant, staggerContainer, EASE_OUT, DURATIONS } from '@/utils/animations';

export function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: DURATIONS.default, ease: EASE_OUT, delay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxHeroBg({ className = '', ...props }: any) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 150]);

  return (
    <motion.div style={{ y }} className={className} {...props} />
  );
}

export function SlideIn({ children, direction = 'left', delay = 0, className = '' }: { children: React.ReactNode; direction?: 'left' | 'right'; delay?: number; className?: string }) {
  const xOffset = direction === 'left' ? -40 : 40;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={{
        hidden: { opacity: 0, x: xOffset, scale: direction === 'left' ? 0.96 : 1 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: DURATIONS.default, ease: EASE_OUT, delay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FloatAnimation({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
