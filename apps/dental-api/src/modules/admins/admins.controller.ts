import { Request, Response, NextFunction } from 'express';
import * as adminsService from './admins.service';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminsService.getCurrentAdmin(req.user!.id)); } catch (err) { next(err); }
}

export async function getAllAdmins(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminsService.getAllAdmins()); } catch (err) { next(err); }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await adminsService.createAdmin(req.body, req.user!.id)); } catch (err) { next(err); }
}

export async function deactivateAdmin(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminsService.deactivateAdmin(req.params.id)); } catch (err) { next(err); }
}

export async function deleteAdmin(req: Request, res: Response, next: NextFunction) {
  try { res.json(await adminsService.deleteAdmin(req.params.id)); } catch (err) { next(err); }
}
