'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './BeforeAfterSlider.module.css';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  caption?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before treatment',
  afterAlt = 'After treatment',
  caption,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50); // 0–100 (%)
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  /** Translate a clientX into a 0–100 position value */
  const calcPosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  // ── Mouse handling ─────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDragging.current) calcPosition(e.clientX);
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [calcPosition]);

  // ── Touch handling ─────────────────────────────────────────
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => calcPosition(e.touches[0].clientX),
    [calcPosition],
  );

  // ── Keyboard support (arrow keys on handle) ───────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  setPosition((p) => Math.max(0, p - 2));
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2));
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Slider canvas */}
      <div
        ref={containerRef}
        className={styles.canvas}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchMove}
        role="img"
        aria-label="Interactive before and after comparison"
      >
        {/* ── AFTER image — base layer (always fully visible) ── */}
        <div className={styles.imgLayer}>
          <Image
            src={afterSrc}
            alt={afterAlt}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className={styles.img}
          />
        </div>

        {/* ── BEFORE image — top layer, clipped from right ───── */}
        {/*  clip-path: inset(0 X% 0 0) hides the right X% of the image  */}
        {/*  so the before shows on the left up to the divider position   */}
        <div
          className={styles.imgLayer}
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={beforeSrc}
            alt={beforeAlt}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className={styles.img}
          />
        </div>

        {/* ── Floating labels ─────────────────────────────────── */}
        <span className={`${styles.label} ${styles.labelBefore}`} aria-hidden="true">
          Before
        </span>
        <span className={`${styles.label} ${styles.labelAfter}`} aria-hidden="true">
          After
        </span>

        {/* ── Divider + draggable handle ───────────────────────── */}
        <div className={styles.divider} style={{ left: `${position}%` }}>
          <div className={styles.dividerLine} />
          <button
            className={styles.handle}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            aria-label={`Drag to compare. Currently showing ${Math.round(position)}% before.`}
            aria-valuenow={Math.round(position)}
            aria-valuemin={0}
            aria-valuemax={100}
            role="slider"
            type="button"
          >
            <ChevronLeft size={15} aria-hidden="true" />
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Caption */}
      {caption && <p className={styles.caption}>{caption}</p>}

      {/* Disclaimer */}
      <p className={styles.disclaimer}>
        * Results vary depending on individual oral health and treatment plans.
      </p>
    </div>
  );
}
