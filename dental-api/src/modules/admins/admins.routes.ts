import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as controller from './admins.controller';

const router = Router();

// Any authenticated admin can fetch their own profile
router.get('/me', verifyToken, requireRole('ADMIN'), controller.getMe);

// SUPER_ADMIN only — manage other admins
router.get('/', verifyToken, requireRole('SUPER_ADMIN'), controller.getAllAdmins);
router.post('/', verifyToken, requireRole('SUPER_ADMIN'), controller.createAdmin);
router.patch('/:id/deactivate', verifyToken, requireRole('SUPER_ADMIN'), controller.deactivateAdmin);
router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), controller.deleteAdmin);

export default router;
