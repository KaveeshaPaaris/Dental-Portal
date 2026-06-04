import { Request, Response, NextFunction } from 'express';
import * as inventoryService from './inventory.service';

export async function getAllItems(req: Request, res: Response, next: NextFunction) {
  try { res.json(await inventoryService.getAllItems()); } catch (err) { next(err); }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await inventoryService.createItem(req.body, req.user!.id)); } catch (err) { next(err); }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try { res.json(await inventoryService.updateItem(req.params.id, req.body, req.user!.id)); } catch (err) { next(err); }
}

export async function logStockChange(req: Request, res: Response, next: NextFunction) {
  try { res.json(await inventoryService.logStockChange(req.params.id, req.body, req.user!.id)); } catch (err) { next(err); }
}

export async function getItemLogs(req: Request, res: Response, next: NextFunction) {
  try { res.json(await inventoryService.getItemLogs(req.params.id)); } catch (err) { next(err); }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try { res.json(await inventoryService.deleteItem(req.params.id)); } catch (err) { next(err); }
}
