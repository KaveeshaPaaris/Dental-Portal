import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service';
import { createError } from '../../middleware/error.middleware';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.getNotifications(req.user!.role, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!UUID_RE.test(req.params.id)) throw createError('Invalid notification id', 400);
    const data = await notificationsService.markAsRead(req.params.id, req.user!.role, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.markAllAsRead(req.user!.role, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}
