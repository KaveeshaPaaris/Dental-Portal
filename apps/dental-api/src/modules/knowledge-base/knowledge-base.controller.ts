import { Request, Response, NextFunction } from 'express';
import * as kbService from './knowledge-base.service';

export async function getAllArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await kbService.getAllArticles();
    res.json(data);
  } catch (err) { next(err); }
}

export async function getArticleById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await kbService.getArticleById(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function createArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, category, content, status } = req.body;
    if (!title || !category || !content || !status) {
      res.status(400).json({ error: 'title, category, content, and status are required.' });
      return;
    }
    const data = await kbService.createArticle({ title, category, content, status });
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await kbService.updateArticle(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

export async function deleteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await kbService.deleteArticle(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}
