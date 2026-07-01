import { Router } from 'express';
import { publicLimiter } from '../../middleware/rateLimiter.middleware';
import * as controller from './ai-chat.controller';

const router = Router();

/**
 * POST /api/v1/ai-chat/message
 * Standard JSON response — used by the existing frontend chat UI.
 * Rate limited: 60 requests/minute per IP.
 */
router.post('/message', publicLimiter, controller.handleChatMessage);

/**
 * POST /api/v1/ai-chat/stream
 * Server-Sent Events (SSE) — real-time token streaming.
 * Stricter rate limit: 20 requests/minute per IP to protect Gemini quota.
 */
import rateLimit from 'express-rate-limit';

const streamLimiter = rateLimit({
  windowMs: 60 * 1_000,
  max: 20,
  message: { error: 'Too many streaming requests. Please slow down.' },
});

router.post('/stream', streamLimiter, controller.handleChatStream);

export default router;
