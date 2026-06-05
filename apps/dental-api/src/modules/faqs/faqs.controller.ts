import { Request, Response, NextFunction } from 'express';
import * as faqsService from './faqs.service';

export async function getPublicFAQs(req: Request, res: Response, next: NextFunction) {
  try { res.json(await faqsService.getPublicFAQs()); } catch (err) { next(err); }
}

export async function askQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'question field is required' });
      return;
    }
    res.json(await faqsService.answerQuestion(question));
  } catch (err) { next(err); }
}

export async function getAllFAQs(req: Request, res: Response, next: NextFunction) {
  try { res.json(await faqsService.getAllFAQs()); } catch (err) { next(err); }
}

export async function createFAQ(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await faqsService.createFAQ(req.body)); } catch (err) { next(err); }
}

export async function updateFAQ(req: Request, res: Response, next: NextFunction) {
  try { res.json(await faqsService.updateFAQ(req.params.id, req.body)); } catch (err) { next(err); }
}

export async function deleteFAQ(req: Request, res: Response, next: NextFunction) {
  try { res.json(await faqsService.deleteFAQ(req.params.id)); } catch (err) { next(err); }
}
