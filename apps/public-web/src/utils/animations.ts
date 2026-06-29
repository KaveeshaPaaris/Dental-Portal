import { Variants } from 'framer-motion';

// Standard timings requested: 0.6 - 0.9s
export const DURATIONS = {
  default: 0.7,
  slow: 0.9,
  fast: 0.4
};

// "trigger animations only once when elements enter the viewport (about 20–30% visibility)"
export const VIEWPORT_CONFIG = { once: true, margin: '0px 0px -20% 0px' };

export const EASE_OUT = 'easeOut'; // Requested easing

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: DURATIONS.default, ease: EASE_OUT } 
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12 // Used for features, services, etc.
    }
  }
};

// Features Card specific animation requested
export const featureCardVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: DURATIONS.default, ease: EASE_OUT } 
  }
};

// Services Card specific animation requested
export const serviceCardVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: DURATIONS.default, ease: EASE_OUT } 
  }
};
