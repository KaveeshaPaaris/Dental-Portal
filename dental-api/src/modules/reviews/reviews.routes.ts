import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as controller from './reviews.controller';

const router = Router();

// PUBLIC
router.get('/public', controller.getPublicReviews);
router.get('/submit/:token', controller.validateToken);
router.post('/submit/:token', controller.submitReview);

// ADMIN
router.get('/', verifyToken, requireRole('ADMIN'), controller.getAllReviews);
router.patch('/:id/accept', verifyToken, requireRole('ADMIN'), controller.acceptReview);
router.patch('/:id/reject', verifyToken, requireRole('ADMIN'), controller.rejectReview);

export default router;
