import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from './auth.service';

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in E.164 format, e.g. +919876543210'),
});

const verifySchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in E.164 format, e.g. +919876543210'),
  code: z.string().length(6, 'OTP code must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

/**
 * POST /api/v1/auth/send-whatsapp-otp
 * Body: { phone: "+919876543210" }
 */
export async function sendWhatsappOtp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { phone } = phoneSchema.parse(req.body);
    await authService.sendWhatsappOtp(phone);
    res.status(200).json({
      success: true,
      message: `WhatsApp OTP sent to ${phone}. It expires in 10 minutes.`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/v1/auth/verify-whatsapp-otp
 * Body: { phone: "+919876543210", code: "123456" }
 */
export async function verifyWhatsappOtp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { phone, code } = verifySchema.parse(req.body);
    const result = await authService.verifyWhatsappOtp(phone, code);
    res.status(200).json({
      success: true,
      isNewUser: result.isNewUser,
      phone: result.phone,
      message: result.isNewUser
        ? 'Welcome! Your account has been created.'
        : 'Welcome back!',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
}
