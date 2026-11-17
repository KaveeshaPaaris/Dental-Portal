import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as controller from './schedule.controller';
import { createOverrideSchema } from './schedule.schema';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────
router.get('/overrides', controller.getOverrides);
router.get('/overrides/:date', controller.getOverrideByDate);

// ─── ADMIN ───────────────────────────────────────────────────
router.post('/overrides', verifyToken, requireRole('SUPER_ADMIN'), validate(createOverrideSchema), controller.upsertOverride);
router.delete('/overrides/:date', verifyToken, requireRole('SUPER_ADMIN'), controller.deleteOverride);

export default router;
