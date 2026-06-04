import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as controller from './notifications.controller';

const router = Router();
router.use(verifyToken, requireRole('ADMIN'));

router.get('/', controller.getNotifications);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

export default router;
