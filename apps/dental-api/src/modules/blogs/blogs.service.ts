import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';
import type { CreateBlogInput, UpdateBlogInput } from './blogs.schema';

// ─── PUBLIC ──────────────────────────────────────────────────

export async function getPublishedBlogs(page = 1, limit = 12) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, category, cover_image, published_at, created_at', { count: 'exact' })
    .eq('is_published', true)
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
    .eq('is_published', true)
    .single();

  if (error || !data) throw createError('Blog post not found', 404);
  return data;
}

// ─── ADMIN ───────────────────────────────────────────────────

export async function getAllBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw createError('Failed to fetch blogs', 500);
  return data ?? [];
}

export async function createBlog(input: CreateBlogInput, authorId: string) {
  const { data, error } = await supabase
    .from('blogs')
    .insert({
      ...input,
      cover_image: input.cover_image || null,
      author_id: authorId,
      published_at: input.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw createError('A blog post with this slug already exists', 409);
    throw createError('Failed to create blog post', 500);
  }
  return data;
}

export async function updateBlog(id: string, input: UpdateBlogInput) {
  // If publishing for the first time, set published_at
  const updateData: Record<string, unknown> = { ...input };
  if (input.cover_image === '') updateData.cover_image = null;

  if (input.is_published === true) {
    // Check if it was previously unpublished
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
