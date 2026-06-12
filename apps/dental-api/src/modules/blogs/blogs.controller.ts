import { Request, Response, NextFunction } from 'express';
import * as blogsService from './blogs.service';

// ─── PUBLIC ──────────────────────────────────────────────────

export async function getPublishedBlogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const data = await blogsService.getPublishedBlogs(page, limit);
    res.json(data);
  } catch (err) { next(err); }
}

export async function getBlogBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await blogsService.getBlogBySlug(req.params.slug);
    res.json(data);
  } catch (err) { next(err); }
}

// ─── ADMIN ───────────────────────────────────────────────────

export async function getAllBlogs(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await blogsService.getAllBlogs();
    res.json(data);
  } catch (err) { next(err); }
}

export async function createBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await blogsService.createBlog(req.body, req.user!.id);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await blogsService.updateBlog(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

export async function deleteBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await blogsService.deleteBlog(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}
