'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';

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
  const inView = useInView(ref, { once: true, margin: '0px' });
  const count = useMotionValue(0);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, {
        duration: duration,
        ease: "easeOut",
      });
      return () => controls.stop();
    }
  }, [inView, count, value, duration]);

  // If it's a float, format with 1 decimal, else whole number
  const displayValue = useTransform(count, (current) => {
    if (value % 1 !== 0) {
      return current.toFixed(1) + suffix;
    }
    return Math.round(current) + suffix;
  });

  const staticValue = value % 1 !== 0 ? value.toFixed(1) + suffix : Math.round(value) + suffix;

  return (
    <>
      <motion.span ref={ref}>{displayValue}</motion.span>
      <noscript>{staticValue}</noscript>
    </>
  );
}
