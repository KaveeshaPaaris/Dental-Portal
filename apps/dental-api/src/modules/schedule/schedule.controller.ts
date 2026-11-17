import { Request, Response, NextFunction } from 'express';
import * as service from './schedule.service';
import { AuthUser } from '../../middleware/auth.middleware';

export const getOverrides = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      res.status(400).json({ error: 'Missing from or to date parameters' });
      return;
    }
    const overrides = await service.getOverrides(from as string, to as string);
    res.json(overrides);
  } catch (error) {
    next(error);
  }
};

export const getOverrideByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params;
    const override = await service.getOverrideByDate(date);
    res.json(override || { message: 'No override found for this date' });
  } catch (error) {
    next(error);
  }
};

export const upsertOverride = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as AuthUser;
    const override = await service.upsertOverride(req.body, user.id);
    res.json(override);
  } catch (error) {
    next(error);
  }
};

export const deleteOverride = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params;
    await service.deleteOverride(date);
    res.json({ message: 'Override deleted successfully' });
  } catch (error) {
    next(error);
  }
};
