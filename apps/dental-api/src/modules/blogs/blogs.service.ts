import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';
import type { CreateBlogInput, UpdateBlogInput } from './blogs.schema';

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Convert is_published boolean (from UI) → status string (DB source of truth).
 * The DB column `is_published` is a GENERATED column, so we never write it directly.
 */
function toStatus(isPublished: boolean): 'PUBLISHED' | 'DRAFT' {
  return isPublished ? 'PUBLISHED' : 'DRAFT';
}

/**
 * Build a clean DB insert/update payload from a validated input object.
 * Strips is_published and maps it to status. Clears empty strings to null.
 */
function buildPayload(input: CreateBlogInput | UpdateBlogInput): Record<string, unknown> {
  const { is_published, cover_image, tags, ...rest } = input as CreateBlogInput;

  const payload: Record<string, unknown> = { ...rest };

  // Map boolean → status enum
  if (is_published !== undefined) {
    payload.status = toStatus(is_published);
  }

  // Empty string → null for nullable URL field
  payload.cover_image = cover_image || null;

  // Ensure tags is always an array (not undefined)
  if (tags !== undefined) {
    payload.tags = tags;
  }

  return payload;
}

// ─── PUBLIC ──────────────────────────────────────────────────────

export async function getPublishedBlogs(page = 1, limit = 12) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, category, cover_image, author, reading_time, published_at, created_at', { count: 'exact' })
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) throw createError('Failed to fetch blogs', 500);
  return { data: data ?? [], total: count ?? 0, page, limit };
}

export async function getBlogBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .single();

  if (error || !data) throw createError('Blog post not found', 404);
  return data;
}

// ─── ADMIN ───────────────────────────────────────────────────────

export async function getAllBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw createError('Failed to fetch blogs', 500);
  return data ?? [];
}

export async function createBlog(input: CreateBlogInput, authorId: string) {
  const payload = buildPayload(input);
  payload.author_id = authorId;

  // Set published_at when first published
  if (input.is_published) {
    payload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blogs')
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw createError('A blog post with this slug already exists', 409);
    throw createError('Failed to create blog post', 500);
  }
  return data;
}

export async function updateBlog(id: string, input: UpdateBlogInput) {
  const updateData = buildPayload(input as CreateBlogInput);

  // Set published_at only on first publish (not if already published)
  if (input.is_published === true) {
    const { data: existing } = await supabase
      .from('blogs')
      .select('published_at')
      .eq('id', id)
      .single();

    if (existing && !existing.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  } else if (input.is_published === false) {
    updateData.published_at = null;
  }

  const { data, error } = await supabase
    .from('blogs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw createError('Failed to update blog post', 500);
  return data;
}

export async function deleteBlog(id: string) {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) throw createError('Failed to delete blog post', 500);
  return { message: 'Blog post deleted' };
}
