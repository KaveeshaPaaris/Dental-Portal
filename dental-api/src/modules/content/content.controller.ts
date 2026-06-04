import { Request, Response, NextFunction } from 'express';
import * as contentService from './content.service';

export async function getPublicContent(req: Request, res: Response, next: NextFunction) {
  try { res.json(await contentService.getContentByKey(req.params.key)); } catch (err) { next(err); }
}

export async function getAllContent(req: Request, res: Response, next: NextFunction) {
  try { res.json(await contentService.getAllContent()); } catch (err) { next(err); }
}

export async function updateContent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await contentService.updateContent(req.params.key, req.body.value, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
}
