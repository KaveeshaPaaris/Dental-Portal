import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { otpLimiter } from '../../middleware/rateLimiter.middleware';
import * as controller from './bookings.controller';
import {
  createBookingSchema,
  verifyOTPSchema,
  resendOTPSchema,
  adminCreateBookingSchema,
  acceptBookingSchema,
  reorderBookingSchema,
  updateBookingStatusSchema,
} from './bookings.schema';

const router = Router();

// ─── PUBLIC ──────────────────────────────────────────────────
router.post('/', validate(createBookingSchema), controller.createBooking);
router.post('/verify-otp', otpLimiter, validate(verifyOTPSchema), controller.verifyOTP);
router.post('/resend-otp', otpLimiter, validate(resendOTPSchema), controller.resendOTP);

// ─── ADMIN ───────────────────────────────────────────────────
router.get('/schedule', verifyToken, requireRole('ADMIN'), controller.getDailySchedule);
router.get('/dates', verifyToken, requireRole('ADMIN'), controller.getBookingDates);
router.get('/', verifyToken, requireRole('ADMIN'), controller.getBookings);
router.post('/admin', verifyToken, requireRole('ADMIN'), validate(adminCreateBookingSchema), controller.adminCreateBooking);
router.get('/:id', verifyToken, requireRole('ADMIN'), controller.getBookingById);
router.patch('/:id/accept', verifyToken, requireRole('ADMIN'), validate(acceptBookingSchema), controller.acceptBooking);
router.patch('/:id/reject', verifyToken, requireRole('ADMIN'), controller.rejectBooking);
router.patch('/:id/complete', verifyToken, requireRole('ADMIN'), controller.completeBooking);
router.patch('/:id/reorder', verifyToken, requireRole('ADMIN'), validate(reorderBookingSchema), controller.reorderBooking);
router.post('/:id/send-confirmation', verifyToken, requireRole('ADMIN'), controller.sendConfirmation);

// Generic endpoint for the frontend's unified status/notes update form
router.patch('/:id/status', verifyToken, requireRole('ADMIN'), validate(updateBookingStatusSchema), controller.handleUpdateBookingStatus);

export default router;

