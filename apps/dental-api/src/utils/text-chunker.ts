/**
 * Text Chunker Utility
 *
 * Splits a knowledge base article into smaller, overlapping chunks
 * suitable for embedding and vector similarity search (RAG).
 *
 * Strategy:
 *   1. Prepend article title to each chunk for added context.
 *   2. Split text into paragraphs first.
 *   3. If a paragraph fits within the chunk window, accumulate it.
 *   4. When a paragraph would overflow, flush the current chunk and start fresh
 *      with a small overlap (tail of the previous chunk) to preserve continuity.
 *   5. If a single paragraph exceeds the chunk window, fall back to
 *      sentence-level splitting.
 *
 * Dimensions (tuned for Gemini text-embedding-004 / 768-dim vectors):
 *   - Target chunk: ~1 500 characters  ≈ 375 tokens  (@ 4 chars/token)
 *   - Overlap     : ~200  characters   ≈  50 tokens
 *
 * When switching embedding models simply adjust CHUNK_SIZE_CHARS /
 * CHUNK_OVERLAP_CHARS — the pipeline does not change.
 */

export interface TextChunk {
  chunkIndex: number;
  content: string;
  /** Approximate token count at 4 chars / token */
  tokenCount: number;
}

// ─── Configuration ────────────────────────────────────────────
const CHUNK_SIZE_CHARS    = 1_500;
const CHUNK_OVERLAP_CHARS = 200;
// ─────────────────────────────────────────────────────────────

/**
 * Splits `text` into overlapping chunks.
 * The article `title` is prepended to every chunk so the embedding
 * model understands the context of each snippet.
 */
export function chunkText(text: string, title: string): TextChunk[] {
  const fullText = `${title}\n\n${text.trim()}`;
  const paragraphs = fullText
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const chunks: TextChunk[] = [];
  let current = '';
  let idx = 0;

  const flush = () => {
    if (!current.trim()) return;
    chunks.push({
      chunkIndex: idx++,
      content: current.trim(),
      tokenCount: Math.ceil(current.length / 4),
    });
  };

  const overlapTail = (text: string): string => {
    const words = text.split(/\s+/);
    let tail = '';
    for (let i = words.length - 1; i >= 0; i--) {
      const candidate = words.slice(i).join(' ');
      if (candidate.length > CHUNK_OVERLAP_CHARS) break;
      tail = candidate;
    }
    return tail;
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > CHUNK_SIZE_CHARS) {
      // Paragraph too large — split by sentences
      flush();
      current = overlapTail(current);

      const sentences = paragraph.match(/[^.!?…]+[.!?…]+(?:\s|$)|[^.!?…]+$/g) ?? [paragraph];
      for (const sentence of sentences) {
        const s = sentence.trim();
        if (!s) continue;
        if (current.length + s.length + 1 <= CHUNK_SIZE_CHARS) {
          current += (current ? ' ' : '') + s;
        } else {
          flush();
          current = overlapTail(current) + (current ? ' ' : '') + s;
        }
      }
    } else if (current.length + paragraph.length + 2 <= CHUNK_SIZE_CHARS) {
      current += (current ? '\n\n' : '') + paragraph;
    } else {
      flush();
      current = overlapTail(current) + (current ? '\n\n' : '') + paragraph;
    }
  }

  flush();

  // Edge case: empty article
  if (chunks.length === 0) {
    chunks.push({
      chunkIndex: 0,
      content: fullText.trim(),
      tokenCount: Math.ceil(fullText.length / 4),
    });
  }

  return chunks;
}
