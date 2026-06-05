import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as controller from './faqs.controller';

const router = Router();

// PUBLIC
router.get('/', controller.getPublicFAQs);
router.post('/ask', controller.askQuestion);

// ADMIN
router.get('/admin', verifyToken, requireRole('ADMIN'), controller.getAllFAQs);
router.post('/admin', verifyToken, requireRole('ADMIN'), controller.createFAQ);
router.patch('/admin/:id', verifyToken, requireRole('ADMIN'), controller.updateFAQ);
router.delete('/admin/:id', verifyToken, requireRole('ADMIN'), controller.deleteFAQ);

export default router;
