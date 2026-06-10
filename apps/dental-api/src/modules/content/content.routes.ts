import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as controller from './content.controller';

const router = Router();

// PUBLIC — fetch individual content key
router.get('/:key', controller.getPublicContent);

// ADMIN
router.get('/', verifyToken, requireRole('ADMIN'), controller.getAllContent);
router.patch('/:key', verifyToken, requireRole('ADMIN'), controller.updateContent);

export default router;
