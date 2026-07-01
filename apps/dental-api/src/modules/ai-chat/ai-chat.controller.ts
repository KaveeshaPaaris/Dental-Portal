import { Request, Response, NextFunction } from 'express';
import * as aiChatService from './ai-chat.service';

/**
 * POST /api/v1/ai-chat/message
 * Body: { message: string, history?: ChatMessage[] }
 */
export async function handleChatMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: '`message` field is required and must be a string.' });
      return;
    }

    const response = await aiChatService.processChat({ message, history });
    res.json(response);
  } catch (err) {
    next(err);
  }
}
