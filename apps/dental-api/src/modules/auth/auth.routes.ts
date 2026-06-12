import { Router } from 'express';
import { otpLimiter } from '../../middleware/rateLimiter.middleware';
import * as controller from './auth.controller';

const router = Router();

/**
 * POST /api/v1/auth/send-whatsapp-otp
 * Sends a 6-digit OTP to the patient's WhatsApp number via Twilio Verify.
 * Rate limited to 5 requests per 10 minutes per IP.
 */
router.post('/send-whatsapp-otp', otpLimiter, controller.sendWhatsappOtp);

/**
 * POST /api/v1/auth/verify-whatsapp-otp
 * Verifies the OTP code and ensures a patient record exists in the DB.
 * Rate limited to prevent brute-force guessing.
 */
router.post('/verify-whatsapp-otp', otpLimiter, controller.verifyWhatsappOtp);

export default router;
