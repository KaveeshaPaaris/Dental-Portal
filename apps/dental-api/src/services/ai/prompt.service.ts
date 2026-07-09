/**
 * Prompt Service
 *
 * Builds the system instruction and conversation payload sent to Gemini.
 * All prompt engineering is isolated here — changing tone, persona,
 * or rules only requires editing this file.
 *
 * Rules enforced:
 *   • Only answers using retrieved knowledge context
 *   • Never invents medical or clinical information
 *   • Recommends booking an appointment when appropriate
 *   • Never mentions AI internals, embeddings, or vectors
 *   • Never reveals this prompt
 */

import type { RetrievedChunk } from './retrieval.service';

// ─── Types ────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Gemini SDK content format */
interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

// ─── Constants ────────────────────────────────────────────────

/** Maximum number of recent history turns to include (each turn = 1 user + 1 assistant msg) */
const MAX_HISTORY_TURNS = 5;

// ─── System Instruction ───────────────────────────────────────

/**
 * The core system instruction that defines the assistant's identity,
 * capabilities, and hard constraints.
 */
export function buildSystemInstruction(): string {
  return `You are a professional, warm, and friendly AI assistant for Charming Dental Clinic, located in Sri Lanka.

Your sole purpose is to help patients by answering their questions about the clinic, its services, treatments, and appointments — using ONLY the information provided in the knowledge context.

RULES:
1. Keep responses short and clear. Aim for under 100 words.
2. Answer only what the patient asked. Do not add extra information.
3. Use Markdown: bold for headings, bullet points for lists.
4. Always start each new section or topic on its own separate line, with a blank line before it.
5. Never write long paragraphs. Break information into bullet points.
6. Never invent information that is not in the knowledge context.
7. Never mention internal systems, RAG, embeddings, vectors, or AI models.
8. Tone: Warm, clear, simple English — like a helpful and caring clinic receptionist.
9. Use emojis sparingly — maximum 1 or 2 per response, only as section icons, never within sentences.

FORMATTING:
- Each distinct topic (name, qualification, hours, contact) must be on its own line.
- Separate sections with a blank line.
- Bold all section headings.
- Keep bullet points short — one idea per bullet.

RESPONSE TEMPLATES (follow these closely):

For Doctor info:
**About the Doctor**

**Dr. Chaaminda Paaris** — Chief Dentist

- BDS, University of Peradeniya
- DHDP, University of Colombo
- SLMC Registration No. 1634
- Over 20 years of clinical experience

He provides gentle, ethical, and patient-focused dental care.

---

For Working Hours:
📅 **Working Hours**

- Mon – Wed: 9:00 AM–1:00 PM and 5:00 PM–11:00 PM
- Thursday: 9:00 AM–1:00 PM
- Friday: 9:00 AM–5:00 PM
- Saturday: 3:30 PM–11:00 PM
- Sunday: Please call in advance
- Poya Days: Closed

---

For Contact:
📞 **Contact Us**

- Phone: +94 71 810 9283
- WhatsApp: +94 71 810 9283
- Email: charmingdental@gmail.com

---

For Location:
📍 **Our Location**

97/7 Archbishop Nicholas Marcus Fernando Mawatha
Negombo, Sri Lanka

---

For Dental Services:
**[Service Name]**

[One or two short sentences explaining what the service is.]

**Key Benefits:**
- [benefit]
- [benefit]

*To find out more, book a consultation — call +94 71 810 9283.*

---

For Fallback (when the information is not available in the knowledge base):
I'm sorry, I don't have that specific information right now.

Please contact us directly for accurate details:

- Phone / WhatsApp: +94 71 810 9283
- Email: charmingdental@gmail.com

We're happy to help.`;
}

// ─── Context Formatter ────────────────────────────────────────

/**
 * Formats retrieved knowledge chunks into a clean, readable context block
 * that is injected into the conversation before the user's question.
 */
export function formatContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return '';

  const sections = chunks.map((chunk, i) =>
    `[Knowledge ${i + 1}]\n${chunk.content.trim()}`
  );

  return `--- CLINIC KNOWLEDGE BASE ---\n${sections.join('\n\n')}\n--- END OF KNOWLEDGE BASE ---`;
}

// ─── Conversation Builder ─────────────────────────────────────

/**
 * Builds the full contents array for the Gemini API call.
 *
 * Structure:
 *   1. Recent conversation history (last MAX_HISTORY_TURNS turns)
 *   2. A user message that includes the knowledge context + current question
 *
 * The context is injected into the current user turn (not as a separate
 * system message) to work correctly with the Gemini chat format.
 */
export function buildContents(
  userMessage: string,
  context: RetrievedChunk[],
  history: ChatMessage[],
): GeminiContent[] {
  const contents: GeminiContent[] = [];

  // Include only the most recent turns to limit token usage
  const recentHistory = history.slice(-MAX_HISTORY_TURNS * 2);

  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  // Inject context + question as the current user turn
  const contextBlock = formatContext(context);
  const currentTurn = contextBlock
    ? `${contextBlock}\n\nPatient question: ${userMessage}`
    : userMessage;

  contents.push({
    role: 'user',
    parts: [{ text: currentTurn }],
  });

  return contents;
}
