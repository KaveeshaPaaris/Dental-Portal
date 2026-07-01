/**
 * Knowledge Base Chunks Service
 *
 * Manages the chunked representations of knowledge base articles.
 * Each article is split into overlapping text chunks, each of which
 * receives a 768-dim vector embedding via Gemini text-embedding-004.
 *
 * Pipeline:
 *   Article save → regenerateChunks() → embedArticleChunks() → pgvector search
 */

import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';
import { chunkText } from '../../utils/text-chunker';
import { embedArticleChunks } from '../../services/ai/embedding.service';

export type EmbeddingStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface KnowledgeBaseChunk {
  id: string;
  article_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  embedding_status: EmbeddingStatus;
  // embedding column exists in DB but is intentionally omitted from
  // TypeScript until the embedding pipeline is active.
  created_at: string;
  updated_at: string;
}

export interface ChunkSearchResult {
  id: string;
  article_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  /** Only present when vector search is active */
  similarity?: number;
}

// ─── CRUD ─────────────────────────────────────────────────────

export async function getChunksByArticleId(articleId: string): Promise<KnowledgeBaseChunk[]> {
  const { data, error } = await supabase
    .from('knowledge_base_chunks')
    .select('id, article_id, chunk_index, content, token_count, embedding_status, created_at, updated_at')
    .eq('article_id', articleId)
    .order('chunk_index', { ascending: true });

  if (error) throw createError('Failed to fetch chunks', 500);
  return (data ?? []) as KnowledgeBaseChunk[];
}

export async function getChunkStats(): Promise<{ total: number; pending: number; done: number; failed: number }> {
  const { data, error } = await supabase
    .from('knowledge_base_chunks')
    .select('embedding_status');

  if (error) throw createError('Failed to fetch chunk stats', 500);
  const rows = data ?? [];
  return {
    total:      rows.length,
    pending:    rows.filter(r => r.embedding_status === 'PENDING').length,
    done:       rows.filter(r => r.embedding_status === 'DONE').length,
    failed:     rows.filter(r => r.embedding_status === 'FAILED').length,
  };
}

// ─── CHUNKING PIPELINE ────────────────────────────────────────

/**
 * Deletes all existing chunks for an article, re-splits the content,
 * and inserts fresh chunks with embedding_status = 'PENDING'.
 *
 * Call this whenever an article's title or content changes.
 */
export async function regenerateChunks(
  articleId: string,
  title: string,
  content: string,
): Promise<KnowledgeBaseChunk[]> {
  // 1. Clear old chunks
  const { error: deleteErr } = await supabase
    .from('knowledge_base_chunks')
    .delete()
    .eq('article_id', articleId);

  if (deleteErr) throw createError('Failed to clear old chunks', 500);

  // 2. Produce new chunks
  const textChunks = chunkText(content, title);

  const rows = textChunks.map(chunk => ({
    article_id:       articleId,
    chunk_index:      chunk.chunkIndex,
    content:          chunk.content,
    token_count:      chunk.tokenCount,
    embedding_status: 'PENDING' as EmbeddingStatus,
  }));

  const { data, error } = await supabase
    .from('knowledge_base_chunks')
    .insert(rows)
    .select('id, article_id, chunk_index, content, token_count, embedding_status, created_at, updated_at');

  if (error || !data) throw createError('Failed to create chunks', 500);

  // Fire embedding pipeline asynchronously — does not block the response
  embedArticleChunks(articleId).catch(err =>
    console.error(`[ChunksService] Embedding pipeline failed for article ${articleId}:`, err.message),
  );

  return data as KnowledgeBaseChunk[];
}

/**
 * Removes all chunks for an article (called when the article is deleted).
 * The ON DELETE CASCADE on the FK handles this automatically in Supabase,
 * but this function is exposed for explicit use.
 */
export async function deleteChunksByArticleId(articleId: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_base_chunks')
    .delete()
    .eq('article_id', articleId);

  if (error) throw createError('Failed to delete chunks', 500);
}

// ─── RAG RETRIEVAL ────────────────────────────────────────────
// Note: The primary retrieval path is now in services/ai/retrieval.service.ts
// which calls match_knowledge_chunks() directly.
// This function is retained for backward compatibility.

export async function searchSimilarChunks(
  queryEmbedding: number[],
  options: { topK?: number; matchThreshold?: number } = {},
): Promise<ChunkSearchResult[]> {
  const { topK = 5, matchThreshold = 0.7 } = options;

  const { data, error } = await supabase.rpc('match_knowledge_chunks', {
    query_embedding:  queryEmbedding,
    match_threshold:  matchThreshold,
    match_count:      topK,
  });

  if (error) {
    console.error('[ChunksService] pgvector RPC error:', error.message);
    return [];
  }

  return (data ?? []) as ChunkSearchResult[];
}
