/**
 * Embedding Service
 *
 * Generates 768-dimensional vector embeddings using Google's
 * text-embedding-004 model. The output dimension matches the
 * pgvector column: embedding vector(768).
 *
 * This is the ONLY place in the application that calls the embedding API.
 * The model is configurable via EMBEDDING_MODEL env var.
 */

import { getGeminiClient } from './gemini.client';
import { env } from '../../config/env';
import { supabase } from '../../config/supabase';

// ─── Public API ───────────────────────────────────────────────

/**
 * Generates a 768-dimensional vector embedding for the given text.
 * Used for both indexing knowledge chunks and embedding user queries.
 *
 * @throws Error with a user-friendly message on API failure
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text.');
  }

  try {
    const client = getGeminiClient();
    const result = await client.models.embedContent({
      model: env.EMBEDDING_MODEL,
      contents: text.trim(),
      config: { outputDimensionality: 768 },
    });

    const values = result.embeddings?.[0]?.values;
    if (!values || values.length === 0) {
      throw new Error('Embedding API returned an empty vector.');
    }

    return values;
  } catch (err: any) {
    // Surface a clean error — never leak API internals
    const message = err?.message ?? 'Unknown error';
    console.error('[EmbeddingService] Failed to generate embedding:', message);

    if (message.includes('API_KEY') || message.includes('401') || message.includes('403')) {
      throw new Error('AI service authentication failed. Please check the API key configuration.');
    }

    throw new Error('Failed to generate text embedding. Please try again later.');
  }
}

// ─── Chunk Embedding Pipeline ─────────────────────────────────

/**
 * Generates and stores embeddings for all chunks of a given article
 * that currently have embedding_status = 'PENDING'.
 *
 * Processes chunks sequentially to respect API rate limits.
 * Each chunk is updated in Supabase individually so a partial failure
 * does not discard already-generated embeddings.
 *
 * Called automatically after article create/update.
 */
export async function embedArticleChunks(articleId: string): Promise<void> {
  // Fetch only PENDING chunks for this article
  const { data: chunks, error } = await supabase
    .from('knowledge_base_chunks')
    .select('id, content')
    .eq('article_id', articleId)
    .eq('embedding_status', 'PENDING');

  if (error) {
    console.error(`[EmbeddingService] Failed to fetch chunks for article ${articleId}:`, error.message);
    return;
  }

  if (!chunks || chunks.length === 0) return;

  console.log(`[EmbeddingService] Embedding ${chunks.length} chunk(s) for article ${articleId}...`);

  for (const chunk of chunks) {
    try {
      // Mark as PROCESSING to prevent duplicate work if the job runs concurrently
      await supabase
        .from('knowledge_base_chunks')
        .update({ embedding_status: 'PROCESSING' })
        .eq('id', chunk.id);

      const vector = await generateEmbedding(chunk.content);

      await supabase
        .from('knowledge_base_chunks')
        .update({
          embedding: JSON.stringify(vector),   // Supabase stores pgvector as JSON array
          embedding_status: 'DONE',
          updated_at: new Date().toISOString(),
        })
        .eq('id', chunk.id);

      console.log(`[EmbeddingService] ✓ Chunk ${chunk.id} embedded (${vector.length} dims)`);
    } catch (err: any) {
      console.error(`[EmbeddingService] ✗ Failed to embed chunk ${chunk.id}:`, err.message);
      await supabase
        .from('knowledge_base_chunks')
        .update({ embedding_status: 'FAILED' })
        .eq('id', chunk.id);
    }

    // Small delay between API calls to stay within free-tier rate limits
    await sleep(300);
  }

  console.log(`[EmbeddingService] Finished embedding article ${articleId}.`);
}

// ─── Helpers ──────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
