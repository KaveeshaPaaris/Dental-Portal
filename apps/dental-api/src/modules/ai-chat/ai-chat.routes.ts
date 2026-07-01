import { Router } from 'express';
import { publicLimiter } from '../../middleware/rateLimiter.middleware';
import * as controller from './ai-chat.controller';

const router = Router();

/**
 * POST /api/v1/ai-chat/message
 * Public endpoint — accepts a chat message and returns an AI-generated answer.
 * Rate-limited to prevent abuse.
 */
router.post('/message', publicLimiter, controller.handleChatMessage);

export default router;
