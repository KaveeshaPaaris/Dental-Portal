import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as controller from './blogs.controller';
import { createBlogSchema, updateBlogSchema } from './blogs.schema';

const router = Router();

// PUBLIC
router.get('/', controller.getPublishedBlogs);
router.get('/:slug', controller.getBlogBySlug);

// ADMIN
router.get('/admin/all', verifyToken, requireRole('ADMIN'), controller.getAllBlogs);
router.post('/admin', verifyToken, requireRole('ADMIN'), validate(createBlogSchema), controller.createBlog);
router.patch('/admin/:id', verifyToken, requireRole('ADMIN'), validate(updateBlogSchema), controller.updateBlog);
router.delete('/admin/:id', verifyToken, requireRole('ADMIN'), controller.deleteBlog);

export default router;
