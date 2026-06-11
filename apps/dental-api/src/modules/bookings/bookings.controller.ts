import { Request, Response, NextFunction } from 'express';
import * as bookingsService from './bookings.service';

// ─── PUBLIC ──────────────────────────────────────────────────

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookingsService.createBooking(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function verifyOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookingsService.verifyBookingOTP(
      req.body.booking_id,
      req.body.phone,
      req.body.code
    );
    res.json(result);
  } catch (err) { next(err); }
}

export async function resendOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookingsService.resendBookingOTP(req.body.booking_id, req.body.phone);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── ADMIN ───────────────────────────────────────────────────

export async function getBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, date, session, page, limit } = req.query as Record<string, string>;
    const data = await bookingsService.getBookings({ 
      status, 
      date, 
      session,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.json(data);
  } catch (err) { next(err); }
}

export async function getDailySchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = req.query as { date: string };
    if (!date) { res.status(400).json({ error: 'date query param required' }); return; }
    const data = await bookingsService.getDailySchedule(date);
    res.json(data);
  } catch (err) { next(err); }
}

export async function getBookingById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.getBookingById(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function adminCreateBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.adminCreateBooking(req.body, req.user!.id);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function acceptBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.acceptBooking(req.params.id, req.body, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function rejectBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.rejectBooking(req.params.id, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function completeBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.completeBooking(req.params.id, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function sendConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookingsService.sendBookingConfirmation(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function reorderBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.reorderBooking(req.params.id, req.body.slot_order);
    res.json(data);
  } catch (err) { next(err); }
}
