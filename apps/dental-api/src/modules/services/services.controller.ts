import { Request, Response, NextFunction } from 'express';
import * as servicesService from './services.service';

export async function getAllServices(req: Request, res: Response, next: NextFunction) {
  try {
    const includeDrafts = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
    const services = await servicesService.getAllServices(includeDrafts);
    res.json(services);
  } catch (error) {
    next(error);
  }
}

export async function getServiceBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await servicesService.getServiceBySlug(req.params.slug);
    res.json(service);
  } catch (error) {
    next(error);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await servicesService.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await servicesService.updateService(req.params.id, req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await servicesService.deleteService(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
