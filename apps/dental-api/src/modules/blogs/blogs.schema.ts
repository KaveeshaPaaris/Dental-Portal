import { z } from 'zod';

// ─── Create ───────────────────────────────────────────────────────
export const createBlogSchema = z.object({
  // Required core fields
  title:            z.string().min(3, 'Title must be at least 3 characters'),
  slug:             z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  excerpt:          z.string().min(10, 'Excerpt must be at least 10 characters'),
  content:          z.string().min(20, 'Content must be at least 20 characters'),
  category:         z.string().min(1).default('General Dentistry'),

  // Optional enrichment fields
  cover_image:      z.string().url('Must be a valid URL').optional().or(z.literal('')),
  author:           z.string().min(1).optional(),
  reading_time:     z.number().int().positive().optional(),
  meta_description: z.string().max(160, 'Meta description should be under 160 characters').optional(),
  seo_keywords:     z.string().optional(),
  tags:             z.array(z.string()).optional().default([]),

  // Publication — note: the DB stores `status` but is_published is also
  // accepted here for backward compat with the existing admin UI
  is_published:     z.boolean().default(false),
});

// ─── Update (all fields optional) ─────────────────────────────────
export const updateBlogSchema = createBlogSchema.partial();

// ─── Types ────────────────────────────────────────────────────────
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
