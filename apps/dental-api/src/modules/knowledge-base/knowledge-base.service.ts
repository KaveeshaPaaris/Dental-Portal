import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';
import { regenerateChunks } from './chunks.service';

export type KnowledgeBaseStatus = 'DRAFT' | 'PUBLISHED';

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  status: KnowledgeBaseStatus;
  chunk_count?: number;
  // embedding and embedding_status columns exist in the DB but are
  // managed solely by the embedding pipeline — not exposed here.
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
    .select(`
      id, title, category, status, created_at, updated_at,
      knowledge_base_chunks ( id )
    `)
    .order('created_at', { ascending: false });

  if (error) throw createError('Failed to fetch knowledge base articles', 500);

  // Flatten chunk count into each article
  return (data ?? []).map((a: any) => ({
    ...a,
    chunk_count: a.knowledge_base_chunks?.length ?? 0,
    knowledge_base_chunks: undefined,
  }));
}

export async function getArticleById(id: string) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, title, category, content, status, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) throw createError('Article not found', 404);
  return data;
}

/**
 * Creates a new article and immediately triggers the chunking pipeline.
 * Chunks are stored with embedding_status = 'PENDING' until the
 * embedding job processes them.
 */
export async function createArticle(input: CreateArticleInput) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .insert(input)
    .select('id, title, category, content, status, created_at, updated_at')
    .single();

  if (error || !data) throw createError('Failed to create article', 500);

  // Fire chunking pipeline asynchronously (do not block the HTTP response)
  regenerateChunks(data.id, data.title, data.content).catch((err) =>
    console.error(`[KB] Chunking failed for article ${data.id}:`, err),
  );

  return data;
}

/**
 * Updates an article. If title or content changed, the chunking pipeline
 * is re-triggered so chunks stay in sync. All existing chunks are deleted
 * and recreated with embedding_status = 'PENDING'.
 */
export async function updateArticle(id: string, input: UpdateArticleInput) {
  const { data, error } = await supabase
    .from('knowledge_base')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, title, category, content, status, created_at, updated_at')
    .single();

  if (error || !data) throw createError('Failed to update article', 500);

  // Re-chunk if the textual content changed
  if (input.title !== undefined || input.content !== undefined) {
    regenerateChunks(data.id, data.title, data.content).catch((err) =>
      console.error(`[KB] Re-chunking failed for article ${data.id}:`, err),
    );
  }

  return data;
}

/**
 * Deletes an article. Chunks are removed automatically via the
 * ON DELETE CASCADE foreign key on `knowledge_base_chunks.article_id`.
 */
export async function deleteArticle(id: string) {
  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('id', id);

  if (error) throw createError('Failed to delete article', 500);
  return { message: 'Article and its chunks deleted successfully' };
}

// ─── RAG SURFACE ─────────────────────────────────────────────
// Used by ai-chat.service.ts as the retrieval source.
// Once pgvector embeddings are live, retrieval moves to
// chunks.service.ts → searchSimilarChunks() instead.

export async function getPublishedArticles() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, title, category, content')
    .eq('status', 'PUBLISHED')
    .order('category', { ascending: true });

  if (error) throw createError('Failed to fetch published articles', 500);
  return data ?? [];
}
