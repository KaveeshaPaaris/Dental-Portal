'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor'),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-md)' }} /> },
);

import ImageUploadField from '@/components/admin/ImageUploadField';
import {
  Newspaper, Edit, Trash2, Plus, Eye, EyeOff,
  X, Clock, Tag, Search, FileText, Globe, Save,
  ChevronDown, Image as ImageIcon, AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { Blog } from '@/types';
import toast from 'react-hot-toast';

// ─── Helpers ───────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Constants ──────────────────────────────────────────────────

const EMPTY_FORM = {
  title:            '',
  slug:             '',
  excerpt:          '',
  content:          '',
  category:         'General Dentistry',
  cover_image:      '',
  author:           'Dr. Chaaminda Paaris',
  reading_time:     1,
  meta_description: '',
  seo_keywords:     '',
  tags:             [] as string[],
  is_published:     false,
};

const CATEGORIES = [
  'General Dentistry', 'Preventive Dentistry', 'Children\'s Dentistry', 
  'Orthodontics', 'Cosmetic Dentistry', 'Dental Implants', 
  'Root Canal Treatment', 'Tooth Extraction', 'Gum Disease', 
  'Emergency Dentistry',
];

// ─── Sub-components ─────────────────────────────────────────────

function CharCounter({ value, max, warn }: { value: string; max: number; warn?: number }) {
  const len = value.length;
  const isWarn  = warn !== undefined && len > warn;
  const isError = len > max;
  const color   = isError ? 'var(--color-error)' : isWarn ? 'var(--color-warning)' : 'var(--color-text-muted)';
  return (
    <span style={{ fontSize: '0.75rem', color, marginLeft: 'auto' }}>
      {len}/{max}
    </span>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
      <AlertCircle size={12} color="var(--color-error)" />
      <span className="form-error">{msg}</span>
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  const addTag = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  const removeTag = (t: string) => onChange(tags.filter(x => x !== t));
  return (
    <div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        padding: '8px 10px', border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)', background: 'var(--color-surface)',
        minHeight: 42,
      }}>
        {tags.map(t => (
          <span key={t} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', background: 'rgba(15,76,129,0.1)',
            color: 'var(--color-primary)', borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem', fontWeight: 500,
          }}>
            {t}
            <button type="button" onClick={() => removeTag(t)}
              style={{ display: 'flex', alignItems: 'center', background: 'none', padding: 0, cursor: 'pointer' }}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
          placeholder={tags.length === 0 ? 'Type a tag and press Enter…' : ''}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            color: 'var(--color-text-primary)', fontSize: '0.9375rem',
            fontFamily: 'inherit', flex: 1, minWidth: 120,
          }}
        />
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
        Press Enter or comma to add a tag
      </div>
    </div>
  );
}

// ─── Preview Modal ──────────────────────────────────────────────

function PreviewModal({ form, onClose }: { form: typeof EMPTY_FORM; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'flex-start', justifyContent: 'center',
      padding: '24px', overflowY: 'auto',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 780, padding: '40px',
        boxShadow: 'var(--shadow-xl)', animation: 'fadeIn 0.2s ease-out',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
            Preview
          </span>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            <X size={16} /> Close
          </button>
        </div>
        {/* Cover image */}
        {form.cover_image && (
          <div style={{ width: '100%', height: 320, position: 'relative', marginBottom: 28, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-surface-2)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.cover_image} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="badge badge-primary">{form.category}</span>
          {form.reading_time && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> {form.reading_time} min read
            </span>
          )}
          {form.author && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              By {form.author}
            </span>
          )}
        </div>
        {/* Title */}
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>
          {form.title || <span style={{ color: 'var(--color-text-muted)' }}>Untitled Post</span>}
        </h1>
        {/* Excerpt */}
        {form.excerpt && (
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>
            {form.excerpt}
          </p>
        )}
        {/* Tags */}
        {form.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {form.tags.map(t => (
              <span key={t} style={{ padding: '2px 10px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-full)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                #{t}
              </span>
            ))}
          </div>
        )}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: 28 }} />
        {/* Content — rendered as HTML from rich text editor */}
        {form.content
          ? <div dangerouslySetInnerHTML={{ __html: form.content }}
              style={{ lineHeight: 1.8, color: 'var(--color-text-primary)', fontSize: '0.9375rem' }} />
          : <span style={{ color: 'var(--color-text-muted)' }}>No content yet…</span>
        }
        {/* SEO box */}
        {(form.meta_description || form.seo_keywords) && (
          <div style={{ marginTop: 32, padding: 16, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              SEO Preview
            </div>
            <div style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.9375rem' }}>{form.title}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-success)', margin: '2px 0' }}>
              charming-dental.com/blogs/{form.slug}
            </div>
            {form.meta_description && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{form.meta_description}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Blog Form ──────────────────────────────────────────────────

type FormData = typeof EMPTY_FORM;
type Errors = Partial<Record<keyof FormData, string>>;

function validate(form: FormData): Errors {
  const errors: Errors = {};
  if (!form.title.trim())              errors.title    = 'Title is required.';
  else if (form.title.length < 3)      errors.title    = 'Title must be at least 3 characters.';
  else if (form.title.length > 120)    errors.title    = 'Title must be under 120 characters.';

  if (!form.slug.trim())               errors.slug    = 'Slug is required.';
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
                                        errors.slug    = 'Slug: lowercase letters, numbers, hyphens only.';

  if (!form.excerpt.trim())            errors.excerpt  = 'Excerpt is required.';
  else if (form.excerpt.length < 10)   errors.excerpt  = 'Excerpt must be at least 10 characters.';
  else if (form.excerpt.length > 300)  errors.excerpt  = 'Excerpt must be under 300 characters.';

  // content is now HTML — strip tags to get plain text length
  const plainContent = form.content.replace(/<[^>]*>/g, '').trim();
  if (!plainContent)               errors.content  = 'Content is required.';
  else if (plainContent.length < 20) errors.content = 'Content must be at least 20 characters.';

  if (!form.category.trim())           errors.category = 'Category is required.';

  if (form.meta_description && form.meta_description.length > 160)
    errors.meta_description = 'Meta description must be under 160 characters.';

  if (form.cover_image && !/^https?:\/\/.+/.test(form.cover_image))
    errors.cover_image = 'Cover image must be a valid URL (https://…).';

  return errors;
}

interface BlogFormProps {
  editingId: string | null;
  initialData: FormData;
  onSaved: () => void;
  onCancel: () => void;
}

function BlogForm({ editingId, initialData, onSaved, onCancel }: BlogFormProps) {
  const [form, setForm]           = useState<FormData>(initialData);
  const [errors, setErrors]       = useState<Errors>({});
  const [touched, setTouched]     = useState<Set<keyof FormData>>(new Set());
  const [saving, setSaving]       = useState(false);
  const [showPreview, setPreview] = useState(false);
  const [catOpen, setCatOpen]     = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  // Auto-calc reading time whenever content changes
  useEffect(() => {
    if (form.content) {
      setForm(f => ({ ...f, reading_time: estimateReadingTime(f.content) }));
    }
  }, [form.content]);

  // Close category dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const touch = (field: keyof FormData) =>
    setTouched(p => new Set(p).add(field));

  const set = (field: keyof FormData, value: unknown) => {
    setForm(f => ({ ...f, [field]: value }));
    if (touched.has(field)) {
      const errs = validate({ ...form, [field]: value });
      setErrors(e => ({ ...e, [field]: errs[field] }));
    }
  };

  const handleTitleChange = (title: string) => {
    setForm(f => ({
      ...f,
      title,
      slug: editingId ? f.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (publishNow?: boolean) => {
    // Mark all fields touched and run full validation
    setTouched(new Set(Object.keys(EMPTY_FORM) as (keyof FormData)[]));
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors before saving.');
      return;
    }

    const payload = {
      ...form,
      is_published:  publishNow !== undefined ? publishNow : form.is_published,
      cover_image:   form.cover_image || undefined,
      reading_time:  form.reading_time || undefined,
      meta_description: form.meta_description || undefined,
      seo_keywords:  form.seo_keywords || undefined,
      tags:          form.tags,
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/blogs/admin/${editingId}`, payload);
        toast.success('Blog post updated successfully.');
      } else {
        await api.post('/blogs/admin', payload);
        toast.success(payload.is_published ? 'Blog post published!' : 'Draft saved.');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const err = (f: keyof FormData) => touched.has(f) ? errors[f] : undefined;

  const sectionLabel = (icon: React.ReactNode, text: string) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--color-text-muted)',
      marginBottom: 14, marginTop: 8,
    }}>
      {icon}<span>{text}</span>
    </div>
  );

  return (
    <>
      {showPreview && <PreviewModal form={form} onClose={() => setPreview(false)} />}

      <div className="card animate-fadeIn" style={{ marginBottom: 24, border: '2px solid var(--color-primary)' }}>
        {/* ── Card header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setPreview(true)} className="btn btn-secondary btn-sm">
              <Eye size={15} /> Preview
            </button>
            <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ════ SECTION 1: Core Content ════ */}
        {sectionLabel(<FileText size={13} />, 'Content')}

        {/* Row 1: Title + Slug */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Title *</label>
              <CharCounter value={form.title} max={120} warn={90} />
            </div>
            <input
              type="text"
              className={`form-input${err('title') ? ' form-input-error' : ''}`}
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              onBlur={() => touch('title')}
              placeholder="e.g. 10 Tips for Healthier Teeth"
              style={err('title') ? { borderColor: 'var(--color-error)' } : {}}
            />
            <FieldError msg={err('title')} />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">URL Slug *</label>
            </div>
            <input
              type="text"
              className="form-input"
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              onBlur={() => touch('slug')}
              placeholder="10-tips-for-healthier-teeth"
              style={err('slug') ? { borderColor: 'var(--color-error)' } : {}}
            />
            <FieldError msg={err('slug')} />
            {!err('slug') && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Auto-generated from title. Edit if needed.
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Category + Author + Reading Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: 16, marginBottom: 16 }}>
          {/* Category — dropdown + free text */}
          <div className="form-group" style={{ position: 'relative' }} ref={catRef}>
            <label className="form-label">Category *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                onFocus={() => setCatOpen(true)}
                onBlur={() => touch('category')}
                placeholder="e.g. Oral Hygiene"
                style={{ paddingRight: 36 }}
              />
              <ChevronDown size={16} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', pointerEvents: 'none',
              }} />
            </div>
            {catOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                marginTop: 4, overflow: 'hidden',
              }}>
                {(CATEGORIES.includes(form.category) ? CATEGORIES : CATEGORIES.filter(c => c.toLowerCase().includes(form.category.toLowerCase()))).map(c => (
                  <div key={c}
                    onMouseDown={() => { set('category', c); setCatOpen(false); }}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: '0.9375rem',
                      background: form.category === c ? 'var(--color-surface-hover)' : 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = form.category === c ? 'var(--color-surface-hover)' : 'transparent')}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
            <FieldError msg={err('category')} />
          </div>

          <div className="form-group">
            <label className="form-label">Author</label>
            <input
              type="text"
              className="form-input"
              value={form.author}
              onChange={e => set('author', e.target.value)}
              placeholder="Dr. Chaaminda Paaris"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Read Time (min)</label>
            <input
              type="number"
              min={1}
              max={60}
              className="form-input"
              value={form.reading_time}
              onChange={e => set('reading_time', parseInt(e.target.value) || 1)}
              title="Auto-calculated from content"
            />
          </div>
        </div>

        {/* Row 3: Excerpt */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label">Excerpt *</label>
            <CharCounter value={form.excerpt} max={300} warn={250} />
          </div>
          <textarea
            className="form-input"
            rows={2}
            value={form.excerpt}
            onChange={e => set('excerpt', e.target.value)}
            onBlur={() => touch('excerpt')}
            placeholder="A brief summary shown on the blog listing page…"
            style={err('excerpt') ? { borderColor: 'var(--color-error)' } : {}}
          />
          <FieldError msg={err('excerpt')} />
        </div>

        {/* Row 4: Content — rich text editor */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Content *</label>
          <RichTextEditor
            value={form.content}
            onChange={html => set('content', html)}
            hasError={!!err('content')}
          />
          <FieldError msg={err('content')} />
        </div>

        {/* ════ SECTION 2: Media ════ */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />
        {sectionLabel(<ImageIcon size={13} />, 'Featured Image')}

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Cover Image (optional)</label>
          <ImageUploadField
            value={form.cover_image}
            onChange={url => set('cover_image', url)}
            hasError={!!err('cover_image')}
            bucket="blog-images"
          />
          <FieldError msg={err('cover_image')} />
        </div>

        {/* ════ SECTION 3: Tags ════ */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />
        {sectionLabel(<Tag size={13} />, 'Tags')}

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Tags</label>
          <TagInput tags={form.tags} onChange={t => set('tags', t)} />
        </div>

        {/* ════ SECTION 4: SEO ════ */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />
        {sectionLabel(<Globe size={13} />, 'SEO')}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Meta Description</label>
              <CharCounter value={form.meta_description} max={160} warn={140} />
            </div>
            <textarea
              className="form-input"
              rows={3}
              value={form.meta_description}
              onChange={e => set('meta_description', e.target.value)}
              onBlur={() => touch('meta_description')}
              placeholder="Brief description for search engines (≤160 chars)…"
              style={err('meta_description') ? { borderColor: 'var(--color-error)' } : {}}
            />
            <FieldError msg={err('meta_description')} />
          </div>

          <div className="form-group">
            <label className="form-label">SEO Keywords</label>
            <textarea
              className="form-input"
              rows={3}
              value={form.seo_keywords}
              onChange={e => set('seo_keywords', e.target.value)}
              placeholder="dental tips, oral hygiene, teeth cleaning…"
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Comma-separated keywords
            </div>
          </div>
        </div>

        {/* ════ SECTION 5: Publish Controls ════ */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '20px 0' }} />

        {/* Status selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginRight: 4 }}>
            Status:
          </span>
          <button
            type="button"
            onClick={() => set('is_published', false)}
            className={`btn btn-sm ${!form.is_published ? 'btn-secondary' : 'btn-ghost'}`}
            style={!form.is_published ? { borderColor: 'var(--color-warning)', color: 'var(--color-warning)' } : {}}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => set('is_published', true)}
            className={`btn btn-sm ${form.is_published ? 'btn-secondary' : 'btn-ghost'}`}
            style={form.is_published ? { borderColor: 'var(--color-success)', color: 'var(--color-success)' } : {}}
          >
            Published
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => { set('is_published', false); setTimeout(() => handleSubmit(false), 0); }}
            className="btn btn-secondary"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => { set('is_published', true); setTimeout(() => handleSubmit(true), 0); }}
            className="btn btn-primary"
          >
            {saving ? 'Publishing…' : editingId ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function AdminBlogsPage() {
  const [blogs,      setBlogs]      = useState<Blog[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [formInit,   setFormInit]   = useState(EMPTY_FORM);
  const [search,     setSearch]     = useState('');

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs/admin/all');
      setBlogs(res.data);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog post? This cannot be undone.')) return;
    try {
      await api.delete(`/blogs/admin/${id}`);
      toast.success('Blog post deleted');
      fetchBlogs();
    } catch {
      toast.error('Failed to delete blog post');
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      await api.patch(`/blogs/admin/${blog.id}`, { is_published: !blog.is_published });
      toast.success(blog.is_published ? 'Unpublished' : 'Published');
      fetchBlogs();
    } catch {
      toast.error('Failed to update publish status');
    }
  };

  const openNew = () => {
    setEditingId(null);
    setFormInit(EMPTY_FORM);
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const openEdit = (blog: Blog) => {
    setEditingId(blog.id);
    setFormInit({
      title:            blog.title,
      slug:             blog.slug,
      excerpt:          blog.excerpt,
      content:          blog.content,
      category:         blog.category,
      cover_image:      blog.cover_image ?? '',
      author:           blog.author ?? 'Dr. Chaaminda Paaris',
      reading_time:     blog.reading_time ?? 1,
      meta_description: blog.meta_description ?? '',
      seo_keywords:     blog.seo_keywords ?? '',
      tags:             blog.tags ?? [],
      is_published:     blog.is_published,
    });
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingId(null);
    fetchBlogs();
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div className="skeleton" style={{ height: 600 }} />;

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Newspaper color="var(--color-primary)" /> Blog Posts
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Create and manage blog posts for the public website.
          </p>
        </div>
        {!showForm && (
          <button onClick={openNew} className="btn btn-primary">
            <Plus size={18} /> New Post
          </button>
        )}
      </div>

      {/* ── Blog Form (inline) ── */}
      {showForm && (
        <BlogForm
          editingId={editingId}
          initialData={formInit}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Search bar ── */}
      {!showForm && blogs.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* ── Table ── */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Title</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Category</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  {blogs.length === 0
                    ? 'No blog posts yet. Click "New Post" to create your first article.'
                    : 'No posts match your search.'}
                </td>
              </tr>
            ) : (
              filtered.map(blog => (
                <tr key={blog.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500 }}>{blog.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                      /blogs/{blog.slug}
                    </div>
                    {blog.reading_time && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {blog.reading_time} min read
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                      {blog.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {blog.is_published
                      ? <span className="badge badge-success">Published</span>
                      : <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>Draft</span>}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => handleTogglePublish(blog)} className="btn btn-secondary btn-sm"
                        title={blog.is_published ? 'Unpublish' : 'Publish'}>
                        {blog.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => openEdit(blog)} className="btn btn-secondary btn-sm" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(blog.id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
