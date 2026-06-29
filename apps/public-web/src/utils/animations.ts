import { Variants } from 'framer-motion';

// ─── Timings ──────────────────────────────────────────────────────────────────
export const DURATIONS = {
  fast:    0.35,
  default: 0.6,
  slow:    0.85,
};

// ─── Easings ─────────────────────────────────────────────────────────────────
// Cubic-bezier curves for a premium, designed feel
export const EASE_OUT        = [0.16, 1, 0.3, 1] as const;  // expo-out — fast in, graceful stop
export const EASE_OUT_SOFT   = [0.22, 1, 0.36, 1] as const; // slightly softer exit
export const EASE_SPRING     = { type: 'spring', stiffness: 260, damping: 22 } as const;
export const EASE_SPRING_SOFT= { type: 'spring', stiffness: 180, damping: 28 } as const;

// ─── Viewport ─────────────────────────────────────────────────────────────────
// Trigger when element is 10 % inside the viewport (not too early, not too late)
export const VIEWPORT_CONFIG = { once: true, margin: '0px 0px -10% 0px' };

// ─── Base variants ────────────────────────────────────────────────────────────

export const fadeUpVariant: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.default, ease: EASE_OUT },
  },
};

// Stagger container — transparent so children carry their own opacity
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren:  0.10,
      delayChildren:    0.05,
    },
  },
};

// ─── Card variants ────────────────────────────────────────────────────────────

/** Feature cards — scale + lift with spring physics */
export const featureCardVariant: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration:   DURATIONS.default,
      ease:       EASE_OUT,
    },
  },
};

/** Service cards — same treatment, slightly larger y travel */
export const serviceCardVariant: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration:   DURATIONS.default,
      ease:       EASE_OUT,
    },
  },
};
