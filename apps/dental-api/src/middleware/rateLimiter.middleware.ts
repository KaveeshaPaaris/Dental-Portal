import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for public endpoints.
 * 60 requests per minute per IP.
 */
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
});

/**
 * Strict rate limiter for OTP endpoints.
 * 5 requests per 10 minutes per IP — prevents brute-force attacks.
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { error: 'Too many OTP requests. Please try again in 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Booking creation limiter - 5 new booking requests per hour per IP.
 * Protects the clinic inbox and the Resend email quota from spam.
 */
export const bookingCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many booking requests from this network. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
