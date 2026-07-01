import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';

export type KnowledgeBaseStatus = 'DRAFT' | 'PUBLISHED';

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  status: KnowledgeBaseStatus;
  // NOTE: embedding column will be added to this table when RAG is implemented.
  // embedding?: number[]; (vector type in Supabase via pgvector)
  created_at: string;
  updated_at: string;
}

export interface CreateArticleInput {
  title: string;
  category: string;
  content: string;
  status: KnowledgeBaseStatus;
}

export interface UpdateArticleInput {
  title?: string;
  category?: string;
  content?: string;
  status?: KnowledgeBaseStatus;
}

// ─── ADMIN CRUD ───────────────────────────────────────────────

export async function getAllArticles() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, title, category, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw createError('Failed to fetch knowledge base articles', 500);
  return data ?? [];
}

export async function getArticleById(id: string) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw createError('Article not found', 404);
  return data;
}

export async function createArticle(input: CreateArticleInput) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .insert(input)
    .select()
    .single();

  if (error || !data) throw createError('Failed to create article', 500);
  return data;
}

export async function updateArticle(id: string, input: UpdateArticleInput) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw createError('Failed to update article', 500);
  return data;
}

export async function deleteArticle(id: string) {
  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('id', id);

  if (error) throw createError('Failed to delete article', 500);
  return { message: 'Article deleted successfully' };
}

// ─── RAG SURFACE ─────────────────────────────────────────────
// This function will be used by the ai-chat module to fetch context
// documents for retrieval. Once embeddings are implemented, this will
// be replaced with a vector similarity search (pgvector).

export async function getPublishedArticles() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, title, category, content')
    .eq('status', 'PUBLISHED')
    .order('category', { ascending: true });

  if (error) throw createError('Failed to fetch published articles', 500);
  return data ?? [];
}
