import { Request, Response, NextFunction } from 'express';
import { promotionService } from '../services/promotion.service.js';
import {
  createPromotionSchema,
  updatePromotionSchema,
  changePromotionStatusSchema,
  promotionQuerySchema,
} from '../schemas/promotion.schema.js';

export const getPromotions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = promotionQuerySchema.parse(req.query);
    const promotions = await promotionService.getAllPromotions(query);
    res.status(200).json({
      data: promotions,
      count: promotions.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getPromotionsSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const summary = await promotionService.getSummaryMetrics();
    res.status(200).json({
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getPromotionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);
    res.status(200).json({ data: promotion });
  } catch (error) {
    next(error);
  }
};

export const createPromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createPromotionSchema.parse(req.body);
    const created = await promotionService.createPromotion(validatedData);
    res.status(201).json({
      message: 'Promocion creada exitosamente',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = updatePromotionSchema.parse(req.body);
    const updated = await promotionService.updatePromotion(req.params.id, validatedData);
    res.status(200).json({
      message: 'Promocion actualizada exitosamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const changePromotionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = changePromotionStatusSchema.parse(req.body);
    const updated = await promotionService.changePromotionStatus(req.params.id, status);
    res.status(200).json({
      message: `Estado de promocion actualizado a ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await promotionService.deletePromotion(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
