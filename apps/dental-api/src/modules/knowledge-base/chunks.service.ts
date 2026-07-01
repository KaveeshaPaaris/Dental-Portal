/**
 * Knowledge Base Chunks Service
 *
 * Manages the chunked representations of knowledge base articles.
 * Each article is split into overlapping text chunks which will later
 * receive vector embeddings for semantic search (RAG).
 *
 * Current state:
 *   - Chunking pipeline: ACTIVE  (text → chunks stored in DB)
 *   - Embedding pipeline: PENDING (chunks have embedding_status = 'PENDING')
 *   - Vector search:      STUB    (falls back to full-text until embeddings exist)
 *
 * When embeddings are ready:
 *   1. A background job reads chunks with embedding_status = 'PENDING'
 *   2. It calls the embedding model (e.g. Gemini text-embedding-004)
 *   3. It writes the vector to the `embedding` column and sets status = 'DONE'
 *   4. searchSimilarChunks() switches to the pgvector RPC automatically
 */

import { supabase } from '../../config/supabase';
import { createError } from '../../middleware/error.middleware';
import { chunkText } from '../../utils/text-chunker';

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

/**
 * searchSimilarChunks — Semantic retrieval surface for the RAG pipeline.
 *
 * Current state: STUB — returns random published chunks because embeddings
 * don't exist yet. This function's signature will not change when the
 * vector search is activated.
 *
 * Activation checklist:
 *   [ ] Embedding pipeline is running (chunks have embedding_status = 'DONE')
 *   [ ] pgvector extension is enabled in Supabase
 *   [ ] match_knowledge_chunks() SQL function is deployed
 *   [ ] Uncomment the supabase.rpc() call below and remove the fallback
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  options: { topK?: number; matchThreshold?: number } = {},
): Promise<ChunkSearchResult[]> {
  const { topK = 5, matchThreshold = 0.7 } = options;

  // ── ACTIVE (uncomment when embeddings are ready) ──────────────
  // const { data, error } = await supabase.rpc('match_knowledge_chunks', {
  //   query_embedding:  queryEmbedding,
  //   match_threshold:  matchThreshold,
  //   match_count:      topK,
  // });
  // if (error) throw createError('Vector search failed', 500);
  // return (data ?? []) as ChunkSearchResult[];
  // ─────────────────────────────────────────────────────────────

  // ── STUB fallback ─────────────────────────────────────────────
  // Returns published chunks ordered by creation date until embeddings exist.
  const { data, error } = await supabase
    .from('knowledge_base_chunks')
    .select(`
      id,
      article_id,
      chunk_index,
      content,
      token_count,
      knowledge_base!inner ( status )
    `)
    .eq('knowledge_base.status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(topK);

  if (error) return [];
  return (data ?? []).map((row: any) => ({
    id:          row.id,
    article_id:  row.article_id,
    chunk_index: row.chunk_index,
    content:     row.content,
    token_count: row.token_count,
  }));
  // ─────────────────────────────────────────────────────────────
}
