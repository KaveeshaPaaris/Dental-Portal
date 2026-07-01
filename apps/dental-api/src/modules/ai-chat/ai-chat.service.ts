/**
 * AI Chat Service — module entry point
 *
 * Thin adapter that delegates to services/ai/chat.service.ts.
 * The module's public interface (processChat) is preserved so the
 * controller does not need to change.
 *
 * Re-exports ChatMessage for use by the controller.
 */

export type { ChatMessage } from '../../services/ai/prompt.service';
export type { ChatRequest, ChatResponse, StreamChunk } from '../../services/ai/chat.service';

import { chat, chatStream } from '../../services/ai/chat.service';
export { chat as processChat, chatStream };
