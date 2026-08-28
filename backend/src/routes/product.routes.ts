import { Router } from 'express';
import {
  getProducts,
  getProductMetrics,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductActive,
  deleteProduct,
} from '../controllers/product.controller.js';

const router: Router = Router();

// GET /api/v1/products/metrics
router.get('/metrics', getProductMetrics);

// GET /api/v1/products
router.get('/', getProducts);

// GET /api/v1/products/:id
router.get('/:id', getProductById);

// POST /api/v1/products
router.post('/', createProduct);

// PUT /api/v1/products/:id
router.put('/:id', updateProduct);

// PATCH /api/v1/products/:id/toggle
router.patch('/:id/toggle', toggleProductActive);

// DELETE /api/v1/products/:id
router.delete('/:id', deleteProduct);

export const productRoutes: Router = router;
export default router;
