/**
 * Chat Service — Full RAG Orchestrator
 *
 * Executes the complete 5-step RAG pipeline for every patient query:
 *
 *   Step 1  Embed user question        → embedding.service.ts
 *   Step 2  Retrieve relevant chunks   → retrieval.service.ts
 *   Step 3  Check similarity threshold → retrieval.service.ts
 *   Step 4  Build prompt               → prompt.service.ts
 *   Step 5  Generate answer            → Gemini generateContent / generateContentStream
 *
 * Two entry points are provided:
 *   • chat()       — standard async JSON response
 *   • chatStream() — Server-Sent Events (SSE) generator for streamed responses
 */

import { getGeminiClient } from './gemini.client';
import { generateEmbedding } from './embedding.service';
import { retrieveContext, hasRelevantContext, RetrievedChunk } from './retrieval.service';
import { buildSystemInstruction, buildContents, ChatMessage } from './prompt.service';
import { env } from '../../config/env';

// ─── Types ────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  sources: string[];     // article IDs used in the answer
}

export interface StreamChunk {
  type: 'chunk' | 'done' | 'error';
  text?: string;
  sources?: string[];
  message?: string;
}

// ─── Fallback message ─────────────────────────────────────────

const NO_CONTEXT_FALLBACK =
  "I couldn't find information about that in our clinic's knowledge base. " +
  'Please contact the clinic directly for further assistance — ' +
  'you can call or WhatsApp us at +94 71 810 9283.';

const GENERAL_ERROR_FALLBACK =
  "I'm sorry, I'm having trouble processing your request right now. " +
  'Please try again in a moment, or contact the clinic directly at +94 71 810 9283.';

// ─── Standard Chat ────────────────────────────────────────────

/**
 * Runs the full RAG pipeline and returns a complete answer as JSON.
 * Used by the existing POST /api/v1/ai-chat/message endpoint.
 */
export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const { message, history = [] } = request;

  // Step 1 — Embed the user's question
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(message);
  } catch (err: any) {
    console.error('[ChatService] Embedding failed:', err.message);
    return { answer: GENERAL_ERROR_FALLBACK, sources: [] };
  }

  // Step 2 — Retrieve relevant chunks
  const chunks = await retrieveContext(queryEmbedding);

  // Step 3 — Check similarity threshold
  if (!hasRelevantContext(chunks)) {
    console.log('[ChatService] No relevant context found — returning fallback.');
    return { answer: NO_CONTEXT_FALLBACK, sources: [] };
  }

  // Step 4 — Build prompt contents
  const systemInstruction = buildSystemInstruction();
  const contents = buildContents(message, chunks, history);

  // Step 5 — Generate answer
  try {
    const client = getGeminiClient();
    const result = await client.models.generateContent({
      model: env.CHAT_MODEL,
      config: {
        systemInstruction,
        temperature: 0.2,          // Low temperature = more factual, less creative
        maxOutputTokens: 1_024,
      },
      contents,
    });

    const answer = result.text?.trim() ?? '';
    if (!answer) {
      return { answer: GENERAL_ERROR_FALLBACK, sources: [] };
    }

    const sources = deduplicateSources(chunks);
    console.log(`[ChatService] Answer generated. Sources: [${sources.join(', ')}]`);

    return { answer, sources };
  } catch (err: any) {
    console.error('[ChatService] Gemini generateContent error:', err.message);
    return { answer: GENERAL_ERROR_FALLBACK, sources: [] };
  }
}

// ─── Streaming Chat ───────────────────────────────────────────

/**
 * Runs the RAG pipeline and yields streamed token chunks as an
 * async generator. Used by POST /api/v1/ai-chat/stream (SSE).
 *
 * Consumers should write each StreamChunk as an SSE event:
 *   data: <JSON.stringify(chunk)>\n\n
 */
export async function* chatStream(request: ChatRequest): AsyncGenerator<StreamChunk> {
  const { message, history = [] } = request;

  // Step 1 — Embed
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(message);
  } catch (err: any) {
    console.error('[ChatService] Embedding failed (stream):', err.message);
    yield { type: 'error', message: GENERAL_ERROR_FALLBACK };
    return;
  }

  // Step 2 — Retrieve
  const chunks = await retrieveContext(queryEmbedding);

  // Step 3 — Threshold check
  if (!hasRelevantContext(chunks)) {
    yield { type: 'chunk', text: NO_CONTEXT_FALLBACK };
    yield { type: 'done', sources: [] };
    return;
  }

  // Step 4 — Build prompt
  const systemInstruction = buildSystemInstruction();
  const contents = buildContents(message, chunks, history);

  // Step 5 — Stream from Gemini
  try {
    const client = getGeminiClient();
    const stream = await client.models.generateContentStream({
      model: env.CHAT_MODEL,
      config: {
        systemInstruction,
        temperature: 0.2,
        maxOutputTokens: 1_024,
      },
      contents,
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        yield { type: 'chunk', text };
      }
    }

    yield { type: 'done', sources: deduplicateSources(chunks) };
  } catch (err: any) {
    console.error('[ChatService] Gemini streaming error:', err.message);
    yield { type: 'error', message: GENERAL_ERROR_FALLBACK };
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function deduplicateSources(chunks: RetrievedChunk[]): string[] {
  return [...new Set(chunks.map(c => c.article_id))];
}
