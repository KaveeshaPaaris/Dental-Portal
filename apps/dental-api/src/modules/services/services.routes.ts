import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import * as servicesController from './services.controller';

const router = Router();

// Public routes
router.get('/', servicesController.getAllServices);
router.get('/:slug', servicesController.getServiceBySlug);

// Admin routes
router.post('/', verifyToken, servicesController.createService);
router.patch('/:id', verifyToken, servicesController.updateService);
router.delete('/:id', verifyToken, servicesController.deleteService);

export default router;
