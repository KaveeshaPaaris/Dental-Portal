'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { uploadImage } from '@/lib/uploadImage';

interface ImageUploadFieldProps {
  value: string; // The URL of the currently uploaded image, or empty string
  onChange: (url: string) => void;
  bucket?: string;
  hasError?: boolean;
}

export default function ImageUploadField({
  value,
  onChange,
  bucket = 'blog-images',
  hasError,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      // 1. Compress the image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1920, // Max 1080p resolution
        useWebWorker: true,
      });

      // 2. Upload to Supabase Storage
      const url = await uploadImage(compressedFile, bucket);

      // 3. Update parent state
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the file input
    onChange('');
  };

  // ── Render ───────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '3/2',
    maxHeight: 400,
    border: `2px dashed ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-surface-2)',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'border-color var(--transition-fast), background var(--transition-fast)',
  };

  // If there's already an image, show the preview mode
  if (value) {
    return (
      <div style={{ ...containerStyle, borderStyle: 'solid', borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Cover preview"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        {/* Overlay for actions */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          opacity: uploading ? 1 : 0, transition: 'opacity 0.2s',
        }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = uploading ? '1' : '0'}>
          {uploading ? (
            <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Loader2 size={24} className="animate-spin" />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Uploading...</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{ background: 'white', color: 'black', border: 'none' }}
              >
                <ImageIcon size={14} /> Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-danger btn-sm"
              >
                <X size={14} /> Remove
              </button>
            </>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  // If empty, show the upload prompt
  return (
    <div
      style={containerStyle}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = hasError ? 'var(--color-error)' : 'var(--color-border)'}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept="image/*"
        style={{ display: 'none' }}
      />
      {uploading ? (
        <>
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            Compressing & Uploading...
          </span>
        </>
      ) : (
        <>
          <UploadCloud size={32} style={{ color: 'var(--color-text-muted)', marginBottom: 12 }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Click or drag image to upload
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            JPG, PNG, WebP (auto-compressed)
          </span>
        </>
      )}
    </div>
  );
}
