'use client';

import React, { useEffect } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

export default function AnimatedCounter({ 
  value, 
  suffix = '', 
  duration = 2 
}: { 
  value: number; 
  suffix?: string; 
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration * 1000,
  });

  useEffect(() => {
    if (inView) {
      springValue.set(value);
    }
  }, [inView, springValue, value]);

  // If it's a float, format with 1 decimal, else whole number
  const displayValue = useTransform(springValue, (current) => {
    if (value % 1 !== 0) {
      return current.toFixed(1) + suffix;
    }
    return Math.floor(current) + suffix;
  });

  return <motion.span ref={ref}>{displayValue}</motion.span>;
}
