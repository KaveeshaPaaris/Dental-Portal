/**
 * AI Chat Service
 *
 * This module is the core of the AI chat pipeline.
 * It is structured to support Retrieval-Augmented Generation (RAG) in the future.
 *
 * Current state: STUB — returns a placeholder response.
 *
 * Future pipeline (RAG):
 *   1. Embed the user's message using an embedding model (e.g., OpenAI text-embedding-3-small).
 *   2. Perform a semantic vector search against the clinic's knowledge base in the database.
 *   3. Retrieve the top-K relevant context documents/snippets.
 *   4. Construct a prompt with the retrieved context + user message.
 *   5. Call an LLM (e.g., GPT-4o, Gemini) with the constructed prompt.
 *   6. Return the generated answer.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  /** Conversation history for multi-turn context (future use) */
  history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  /** Will carry source document references when RAG is active */
  sources?: string[];
}

/**
 * processChat — main entry point for the AI chat pipeline.
 *
 * @param request - The user's message and optional conversation history.
 * @returns A structured ChatResponse with the answer.
 */
export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  const { message } = request;

  if (!message || message.trim().length === 0) {
    return {
      answer: "I didn't receive a message. Please type your question and try again.",
    };
  }

  // ─── STUB ─────────────────────────────────────────────────────────────────
  // TODO: Replace this stub with the full RAG pipeline when ready.
  //
  // Step 1: Generate embedding for `message`
  //   const embedding = await generateEmbedding(message);
  //
  // Step 2: Search the knowledge base
  //   const contexts = await vectorSearch(embedding, { topK: 5 });
  //
  // Step 3: Build prompt with context
  //   const prompt = buildPrompt(message, contexts);
  //
  // Step 4: Call LLM
  //   const llmResponse = await callLLM(prompt);
  //
  // Step 5: Return structured response
  //   return { answer: llmResponse.text, sources: contexts.map(c => c.title) };
  // ─────────────────────────────────────────────────────────────────────────

  return {
    answer:
      "Thank you for your question! Our AI assistant is currently being set up. " +
      "For immediate help, please call us at +94 71 810 9283 or WhatsApp us. " +
      "We are happy to answer any questions about our services, appointments, or treatments.",
  };
}
