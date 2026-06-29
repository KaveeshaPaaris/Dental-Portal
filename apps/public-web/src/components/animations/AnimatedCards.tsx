'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { featureCardVariant, serviceCardVariant } from '@/utils/animations';

export function AnimatedFeatureCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={featureCardVariant} className={className}>
      {children}
    </motion.div>
  );
}

export function AnimatedServiceCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={serviceCardVariant} className={className}>
      {children}
    </motion.div>
  );
}

const MotionLink = motion.create(Link as any);

export function AnimatedServiceLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <MotionLink href={href} variants={serviceCardVariant} className={className}>
      {children}
    </MotionLink>
  );
}
