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
    const { status, date, booked_date, session, preferred_session, page, limit, sortBy, order } = req.query as Record<string, string>;
    const data = await bookingsService.getBookings({ 
      status, 
      date, 
      booked_date,
      session,
      preferred_session,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      order: order as 'asc' | 'desc',
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

export async function getBookingDates(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.getBookingDatesWithAppointments();
    res.json(data);
  } catch (err) { next(err); }
}

export async function getCreatedBookingDates(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingsService.getCreatedBookingDates();
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

export async function handleUpdateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, notes, assigned_session } = req.body;
    const adminId = req.user!.id;

    // First get current booking state
    const booking = await bookingsService.getBookingById(id);

    // Handle status transition
    if (status && booking.status !== status) {
       if (status === 'ACCEPTED') {
          const assigned_date = booking.assigned_date || booking.preferred_date;
          await bookingsService.acceptBooking(id, { 
            assigned_date, 
            assigned_session: assigned_session || booking.assigned_session || booking.preferred_session,
            notes 
          }, adminId);
       } else if (status === 'REJECTED') {
          if (notes !== undefined) await bookingsService.updateBookingGeneric(id, { notes }, adminId);
          await bookingsService.rejectBooking(id, adminId);
       } else if (status === 'COMPLETED') {
          if (notes !== undefined) await bookingsService.updateBookingGeneric(id, { notes }, adminId);
          await bookingsService.completeBooking(id, adminId);
       } else {
          await bookingsService.updateBookingGeneric(id, { notes, assigned_session, status }, adminId);
       }
    } else {
       // Only updating notes/session
       if (notes !== undefined || assigned_session !== undefined) {
         await bookingsService.updateBookingGeneric(id, { notes, assigned_session }, adminId);
       }
    }

    res.json({ success: true, message: 'Booking updated successfully' });
  } catch (err) { next(err); }
}
