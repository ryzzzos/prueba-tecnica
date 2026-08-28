import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';
import { createCategorySchema } from '../schemas/category.schema.js';

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({ data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(validatedData);
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
};
