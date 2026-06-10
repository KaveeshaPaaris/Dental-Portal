import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as controller from './inventory.controller';

const router = Router();

router.use(verifyToken, requireRole('ADMIN'));

router.get('/', controller.getAllItems);
router.post('/', controller.createItem);
router.patch('/:id', controller.updateItem);
router.post('/:id/log', controller.logStockChange);
router.get('/:id/logs', controller.getItemLogs);
router.delete('/:id', controller.deleteItem);

export default router;
