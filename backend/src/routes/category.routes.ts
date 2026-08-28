import { Router } from 'express';
import { getCategories, getCategoryById, createCategory } from '../controllers/category.controller.js';

const router: Router = Router();

// GET /api/v1/categories
router.get('/', getCategories);

// GET /api/v1/categories/:id
router.get('/:id', getCategoryById);

// POST /api/v1/categories
router.post('/', createCategory);

export const categoryRoutes: Router = router;
