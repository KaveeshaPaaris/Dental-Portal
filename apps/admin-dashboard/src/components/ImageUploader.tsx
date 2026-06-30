'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/uploadImage';

interface ImageUploaderProps {
  /** Current image URL (controlled) */
  value: string;
  /** Called with the new public URL after a successful upload, or '' when cleared */
  onChange: (url: string) => void;
  /** Supabase Storage bucket name */
  bucket: string;
  /** Optional label shown above the uploader */
  label?: string;
}

export default function ImageUploader({ value, onChange, bucket, label }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError('Only JPG, PNG, WebP, or GIF files are allowed.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is too large. Maximum size is 5 MB.');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, bucket);
      onChange(url);
    } catch (err: any) {
      setError(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so selecting the same file again re-triggers onChange
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    onChange('');
    setError(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label className="form-label" style={{ marginBottom: 0 }}>
          {label}
          <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 6, fontSize: '0.8rem' }}>
            (optional)
          </span>
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {value ? (
        /* ── Preview state ─────────────────────────────────── */
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 140,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-2)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Overlay buttons */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = '1')}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0')}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn btn-secondary btn-sm"
              title="Replace image"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              <Upload size={14} /> Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-danger btn-sm"
              title="Remove image"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              <X size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone / upload state ──────────────────────── */
        <button
          type="button"
          disabled={uploading}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            width: '100%',
            height: 140,
            border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 10,
            background: dragOver ? 'var(--color-primary-faint, rgba(93,173,226,0.07))' : 'var(--color-surface-2)',
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--color-text-secondary)',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Uploading…</span>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(93,173,226,0.3)',
                }}
              >
                <ImageIcon size={20} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {dragOver ? 'Drop to upload' : 'Click or drag & drop an image'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                JPG, PNG, WebP — max 5 MB
              </span>
            </>
          )}
        </button>
      )}

      {/* Inline error */}
      {error && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-error, #e74c3c)' }}>
          {error}
        </span>
      )}

      {/* Spin keyframe injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
