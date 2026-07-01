/**
 * AI Chat Service — RAG Pipeline
 *
 * This is the orchestration layer for the AI assistant.
 * The full pipeline is wired and documented below. Each step is either
 * ACTIVE or marked PENDING (stub) until the upstream dependency is ready.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │                       RAG PIPELINE                          │
 * │                                                              │
 * │  User Message                                                │
 * │       │                                                      │
 * │       ▼                                                      │
 * │  [Step 1] embedMessage()        ← PENDING (Gemini API)       │
 * │       │  vector: number[768]                                 │
 * │       ▼                                                      │
 * │  [Step 2] retrieveContext()     ← STUB (pgvector RPC)        │
 * │       │  chunks: ChunkSearchResult[]                         │
 * │       ▼                                                      │
 * │  [Step 3] buildPrompt()         ← ACTIVE                     │
 * │       │  prompt: string                                      │
 * │       ▼                                                      │
 * │  [Step 4] callLLM()             ← PENDING (Gemini API)       │
 * │       │  answer: string                                      │
 * │       ▼                                                      │
 * │  [Step 5] Return ChatResponse                                │
 * └──────────────────────────────────────────────────────────────┘
 */

import { searchSimilarChunks, ChunkSearchResult } from '../knowledge-base/chunks.service';

// ─── Types ────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  /** Full conversation history for multi-turn context */
  history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  /** Source article IDs used for the answer — populated when RAG is active */
  sources?: string[];
  /** Pipeline state for debugging during development */
  _debug?: { stage: string; chunksRetrieved: number };
}

// ─── Step 1: Embed ────────────────────────────────────────────

/**
 * PENDING — call Gemini text-embedding-004 to embed the user's query.
 *
 * Replace this stub with:
 *   const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
 *   const result = await model.embedContent(text);
 *   return result.embedding.values;  // number[] of length 768
 */
async function embedMessage(text: string): Promise<number[]> {
  // STUB: returns an empty vector — vector search will find no results
  void text;
  return [];
}

// ─── Step 2: Retrieve ─────────────────────────────────────────

/**
 * ACTIVE wiring — calls chunks.service.ts → searchSimilarChunks().
 * Currently falls back to published chunks (no vector math).
 * When embeddings exist, the pgvector RPC is activated automatically
 * inside searchSimilarChunks() — no changes needed here.
 */
async function retrieveContext(queryEmbedding: number[]): Promise<ChunkSearchResult[]> {
  return searchSimilarChunks(queryEmbedding, { topK: 5, matchThreshold: 0.7 });
}

// ─── Step 3: Build Prompt ─────────────────────────────────────

/**
 * ACTIVE — constructs a grounded prompt for the LLM.
 * Follows the standard RAG system prompt pattern:
 *   - System instruction with clinic persona
 *   - Retrieved knowledge base context (grounding)
 *   - Conversation history (multi-turn)
 *   - Current user question
 */
export function buildPrompt(message: string, context: ChunkSearchResult[]): string {
  const systemInstruction = [
    'You are a helpful and professional AI assistant for Charming Dental Clinic.',
    'Answer patient questions based ONLY on the provided knowledge base context.',
    'If the answer is not in the context, say you are unsure and recommend the patient',
    'contact the clinic directly. Never make up medical or clinical information.',
    'Be concise, warm, and professional.',
  ].join(' ');

  const contextBlock = context.length > 0
    ? context.map((c, i) => `[Context ${i + 1}]\n${c.content}`).join('\n\n')
    : 'No specific context found in the knowledge base.';

  return [
    `SYSTEM: ${systemInstruction}`,
    '',
    '--- KNOWLEDGE BASE CONTEXT ---',
    contextBlock,
    '--- END CONTEXT ---',
    '',
    `PATIENT QUESTION: ${message}`,
  ].join('\n');
}

// ─── Step 4: Call LLM ─────────────────────────────────────────

/**
 * PENDING — call Gemini generateContent() with the constructed prompt.
 *
 * Replace this stub with:
 *   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
 *   const result = await model.generateContent(prompt);
 *   return result.response.text();
 */
async function callLLM(prompt: string): Promise<string> {
  // STUB: returns a placeholder — swap for the Gemini API call above
  void prompt;
  return null as unknown as string; // signals to processChat that LLM is not active
}

// ─── Step 5: Orchestrate ──────────────────────────────────────

/**
 * processChat — main entry point for the AI chat endpoint.
 * All pipeline steps are called in sequence. Stub steps are bypassed
 * gracefully so the chat UI continues to work during development.
 */
export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  const { message } = request;

  if (!message || message.trim().length === 0) {
    return { answer: "I didn't receive a message. Please type your question and try again." };
  }

  // Step 1 — Embed
  const queryEmbedding = await embedMessage(message);

  // Step 2 — Retrieve
  const contextChunks = await retrieveContext(queryEmbedding);

  // Step 3 — Build prompt (always runs)
  const prompt = buildPrompt(message, contextChunks);

  // Step 4 — Call LLM
  const llmAnswer = await callLLM(prompt);

  // Step 5 — Return
  if (llmAnswer) {
    // Full RAG pipeline is active
    return {
      answer: llmAnswer,
      sources: [...new Set(contextChunks.map(c => c.article_id))],
      _debug: { stage: 'RAG_ACTIVE', chunksRetrieved: contextChunks.length },
    };
  }

  // LLM not active yet — return fallback
  return {
    answer:
      'Thank you for your question! Our AI assistant is currently being configured. ' +
      'For immediate help, please call us at +94 71 810 9283 or WhatsApp us. ' +
      'We are happy to answer any questions about our services, appointments, or treatments.',
    _debug: { stage: 'LLM_PENDING', chunksRetrieved: contextChunks.length },
  };
}
