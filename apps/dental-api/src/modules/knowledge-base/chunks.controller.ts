import { Request, Response, NextFunction } from 'express';
import * as chunksService from './chunks.service';

/** GET /admin/knowledge-base/:id/chunks */
export async function getChunks(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await chunksService.getChunksByArticleId(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

/** POST /admin/knowledge-base/:id/rechunk — manually re-trigger chunking */
export async function rechunkArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: '`title` and `content` are required in the request body.' });
      return;
    }
    const chunks = await chunksService.regenerateChunks(req.params.id, title, content);
    res.json({ message: `Re-chunked successfully. ${chunks.length} chunk(s) created.`, chunks });
  } catch (err) { next(err); }
}

/** GET /admin/knowledge-base/chunks/stats */
export async function getChunkStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await chunksService.getChunkStats();
    res.json(stats);
  } catch (err) { next(err); }
}
