/**
 * Retrieval Service
 *
 * Performs semantic vector search against the knowledge base using
 * the match_knowledge_chunks() PostgreSQL function (pgvector).
 *
 * Returns the top-K chunks most similar to the query embedding.
 * If no chunk meets the similarity threshold, an empty array is returned
 * and the caller is responsible for issuing the fallback response.
 */

import { supabase } from '../../config/supabase';
import { env } from '../../config/env';

export interface RetrievedChunk {
  id: string;
  article_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  similarity: number;
}

/**
 * Searches the knowledge base for chunks semantically similar to
 * the provided query embedding.
 *
 * @param queryEmbedding - 768-dim vector from the embedding service
 * @returns Ranked list of matching chunks with similarity scores
 */
export async function retrieveContext(queryEmbedding: number[]): Promise<RetrievedChunk[]> {
  if (!queryEmbedding || queryEmbedding.length === 0) {
    console.error('[RetrievalService] Received empty query embedding.');
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding:  queryEmbedding,
      match_threshold:  env.SIMILARITY_THRESHOLD,
      match_count:      env.MAX_RETRIEVAL_RESULTS,
    });

    if (error) {
      console.error('[RetrievalService] pgvector RPC error:', error.message);
      return [];
    }

    const results = (data ?? []) as RetrievedChunk[];

    console.log(
      `[RetrievalService] Retrieved ${results.length} chunk(s) ` +
      `(threshold: ${env.SIMILARITY_THRESHOLD}, top-K: ${env.MAX_RETRIEVAL_RESULTS})`
    );

    return results;
  } catch (err: any) {
    console.error('[RetrievalService] Unexpected error during retrieval:', err.message);
    return [];
  }
}

/**
 * Returns true if at least one retrieved chunk meets the configured
 * similarity threshold. This is a fast guard used by the RAG orchestrator
 * to decide whether to call Gemini.
 */
export function hasRelevantContext(chunks: RetrievedChunk[]): boolean {
  return chunks.length > 0 && chunks.some(c => c.similarity >= env.SIMILARITY_THRESHOLD);
}
