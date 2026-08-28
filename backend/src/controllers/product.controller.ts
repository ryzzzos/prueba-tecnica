import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../schemas/product.schema.js';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = productQuerySchema.parse(req.query);
    const products = await productService.getAllProducts(query);
    res.status(200).json({
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const metrics = await productService.getMetrics();
    res.status(200).json({ data: metrics });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const product = await productService.createProduct(validatedData);
    res.status(201).json({
      message: 'Producto creado exitosamente',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id, validatedData);
    res.status(200).json({
      message: 'Producto actualizado exitosamente',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleProductActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isActive } = req.body;
    const product = await productService.toggleProductActive(req.params.id, Boolean(isActive));
    res.status(200).json({
      message: `Producto ${product.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
