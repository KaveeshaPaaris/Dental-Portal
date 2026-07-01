import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as articleController from './knowledge-base.controller';
import * as chunkController from './chunks.controller';

const router = Router();

// All routes require admin authentication
router.use(verifyToken, requireRole('ADMIN'));

// ─── Articles ─────────────────────────────────────────────────
router.get('/',           articleController.getAllArticles);
router.get('/:id',        articleController.getArticleById);
router.post('/',          articleController.createArticle);
router.patch('/:id',      articleController.updateArticle);
router.delete('/:id',     articleController.deleteArticle);

// ─── Chunks ───────────────────────────────────────────────────
router.get('/chunks/stats',       chunkController.getChunkStats);
router.get('/:id/chunks',         chunkController.getChunks);
router.post('/:id/rechunk',       chunkController.rechunkArticle);

export default router;
