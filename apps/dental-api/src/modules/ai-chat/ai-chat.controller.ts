import { Request, Response, NextFunction } from 'express';
import { processChat, chatStream } from './ai-chat.service';

/**
 * POST /api/v1/ai-chat/message
 * Standard JSON response — used by the existing frontend chat UI.
 * Body: { message: string, history?: ChatMessage[] }
 */
export async function handleChatMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: '`message` field is required and must be a string.' });
      return;
    }

    const response = await processChat({ message, history });
    res.json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai-chat/stream
 * Server-Sent Events (SSE) streaming response — for real-time token streaming.
 *
 * SSE event format:
 *   data: {"type":"chunk","text":"Hello "}\n\n
 *   data: {"type":"chunk","text":"there."}\n\n
 *   data: {"type":"done","sources":["uuid-1","uuid-2"]}\n\n
 *   data: [DONE]\n\n
 *
 * On error:
 *   data: {"type":"error","message":"..."}\n\n
 *   data: [DONE]\n\n
 */
export async function handleChatStream(req: Request, res: Response) {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: '`message` field is required and must be a string.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx proxy buffering
  res.flushHeaders();

  const writeEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const generator = chatStream({ message, history });
    for await (const chunk of generator) {
      writeEvent(chunk);
      if (chunk.type === 'done' || chunk.type === 'error') break;
    }
  } catch (err: any) {
    console.error('[SSE] Unexpected streaming error:', err.message);
    writeEvent({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
