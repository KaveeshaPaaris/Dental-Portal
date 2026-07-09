'use client';

import { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';
import styles from './page.module.css';

/**
 * ShareCopyButton — the only Client Component on the blog detail page.
 * Manages the clipboard "copy link" state (copied → tick icon for 2s → back to link icon).
 * The URL is constructed server-side and passed as a prop to avoid window.location.href.
 */
export default function ShareCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copyLink} className={styles.socialBtn} aria-label="Copy link">
      {copied ? <Check size={18} /> : <LinkIcon size={18} />}
    </button>
  );
}
