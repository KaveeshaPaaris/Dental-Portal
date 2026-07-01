import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as controller from './knowledge-base.controller';

const router = Router();

// All knowledge base routes are admin-only
router.use(verifyToken, requireRole('ADMIN'));

router.get('/',         controller.getAllArticles);
router.get('/:id',      controller.getArticleById);
router.post('/',        controller.createArticle);
router.patch('/:id',    controller.updateArticle);
router.delete('/:id',   controller.deleteArticle);

export default router;
