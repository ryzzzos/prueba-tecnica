import { Router } from 'express';
import {
  getPromotions,
  getPromotionsSummary,
  getPromotionById,
  createPromotion,
  updatePromotion,
  changePromotionStatus,
  deletePromotion,
} from '../controllers/promotion.controller.js';

const router: Router = Router();

// GET /api/v1/promotions/summary - Real-time metrics and state counts
router.get('/summary', getPromotionsSummary);

// GET /api/v1/promotions - List all promotions with filters
router.get('/', getPromotions);

// POST /api/v1/promotions - Create new promotion
router.post('/', createPromotion);

// GET /api/v1/promotions/:id - Get promotion by ID
router.get('/:id', getPromotionById);

// PUT /api/v1/promotions/:id - Update promotion
router.put('/:id', updatePromotion);

// PATCH /api/v1/promotions/:id/status - Change status state machine
router.patch('/:id/status', changePromotionStatus);

// DELETE /api/v1/promotions/:id - Delete promotion (only if PROGRAMMED)
router.delete('/:id', deletePromotion);

export const promotionRoutes: Router = router;
