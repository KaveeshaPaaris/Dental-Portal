import { Request, Response, NextFunction } from 'express';
import * as reviewsService from './reviews.service';
import { z } from 'zod';

const submitReviewSchema = z.object({
  content: z.string().min(10, 'Review must be at least 10 characters'),
  rating: z.number().int().min(1).max(5).optional(),
});

export async function getPublicReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reviewsService.getPublicReviews();
    res.json(data);
  } catch (err) { next(err); }
}

export async function validateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reviewsService.validateReviewToken(req.params.token);
    res.json(data);
  } catch (err) { next(err); }
}

export async function submitReview(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = submitReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const result = await reviewsService.submitReview(
      req.params.token,
      parsed.data.content,
      parsed.data.rating
    );
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function getAllReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query as { status?: string };
    const data = await reviewsService.getAllReviews(status);
    res.json(data);
  } catch (err) { next(err); }
}

export async function acceptReview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reviewsService.moderateReview(req.params.id, 'ACCEPTED', req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function rejectReview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reviewsService.moderateReview(req.params.id, 'REJECTED', req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}
