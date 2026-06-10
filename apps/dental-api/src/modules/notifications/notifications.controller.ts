import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.getNotifications(req.user!.role);
    res.json(data);
  } catch (err) { next(err); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.markAsRead(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.markAllAsRead(req.user!.role);
    res.json(data);
  } catch (err) { next(err); }
}
