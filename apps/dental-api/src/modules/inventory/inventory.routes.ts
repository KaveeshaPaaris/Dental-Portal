import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as controller from './inventory.controller';
import { idParamSchema, createItemSchema, updateItemSchema, stockChangeSchema } from './inventory.schema';

const router = Router();

router.use(verifyToken, requireRole('ADMIN'));

router.get('/', controller.getAllItems);
router.post('/', validate(createItemSchema), controller.createItem);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateItemSchema), controller.updateItem);
router.post('/:id/log', validate(idParamSchema, 'params'), validate(stockChangeSchema), controller.logStockChange);
router.get('/:id/logs', validate(idParamSchema, 'params'), controller.getItemLogs);
// Hard delete: SUPER_ADMIN only
router.delete('/:id', requireRole('SUPER_ADMIN'), validate(idParamSchema, 'params'), controller.deleteItem);

export default router;
