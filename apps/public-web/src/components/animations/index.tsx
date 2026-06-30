'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import {
  VIEWPORT_CONFIG,
  staggerContainer,
  EASE_OUT,
  EASE_OUT_SOFT,
  EASE_SPRING_SOFT,
  DURATIONS,
} from '@/utils/animations';

// ─── FadeUp ───────────────────────────────────────────────────────────────────
/** Fades + lifts an element into view on scroll. */
export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={{
        hidden:  { opacity: 0, y: 40, filter: 'blur(4px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: DURATIONS.default, ease: EASE_OUT, delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerContainer ─────────────────────────────────────────────────────────
/** Wraps children so they animate in one-by-one with a stagger. */
export function StaggerContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

// ─── ParallaxHeroBg ───────────────────────────────────────────────────────────
/** Applies a smooth parallax scroll to the hero background. */
export function ParallaxHeroBg({ className = '', ...props }: any) {
  const { scrollY } = useScroll();
  const rawY = useTransform(scrollY, [0, 800], [0, 120]);
  // Spring-smooth the transform so it never feels jerky
  const y = useSpring(rawY, { stiffness: 60, damping: 20, restDelta: 0.001 });

  return <motion.div style={{ y }} className={className} {...props} />;
}

// ─── SlideIn ─────────────────────────────────────────────────────────────────
/** Slides + fades an element in from left or right. */
export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const xOffset = direction === 'left' ? -48 : 48;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={{
        hidden:  { opacity: 0, x: xOffset },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: DURATIONS.slow,
            ease: EASE_OUT_SOFT,
            delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── FloatAnimation ───────────────────────────────────────────────────────────
/** Gentle idle float — only applied to decorative elements. */
export function FloatAnimation({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatType: 'mirror',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── RevealOnScroll ───────────────────────────────────────────────────────────
/**
 * Generic scroll-reveal wrapper. Useful for CTA banners, section headers, etc.
 * Uses a clean clip-path reveal for a high-end editorial feel.
 */
export function RevealOnScroll({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      variants={{
        hidden:  { opacity: 0, scale: 0.97, y: 24 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: DURATIONS.slow, ease: EASE_OUT_SOFT, delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
