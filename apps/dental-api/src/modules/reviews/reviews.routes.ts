import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as controller from './reviews.controller';

const router = Router();

// ─── PUBLIC ───────────────────────────────────────────────────
router.get('/public', controller.getPublicReviews);
router.get('/featured', controller.getFeaturedReviews);
router.get('/submit/:token', controller.validateToken);
router.post('/submit/:token', controller.submitReview);

// ─── ADMIN (any admin can view) ───────────────────────────────
router.get('/', verifyToken, requireRole('ADMIN'), controller.getAllReviews);

// ─── SUPER ADMIN ONLY (approve / reject / feature) ───────────
router.patch('/:id/accept', verifyToken, requireRole('SUPER_ADMIN'), controller.acceptReview);
router.patch('/:id/reject', verifyToken, requireRole('SUPER_ADMIN'), controller.rejectReview);
router.patch('/:id/feature', verifyToken, requireRole('SUPER_ADMIN'), controller.featureReview);

export default router;
