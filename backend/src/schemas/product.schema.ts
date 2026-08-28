import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'El nombre del producto debe tener al menos 2 caracteres').max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  price: z.number().positive('El precio debe ser un valor positivo'),
  sku: z.string().trim().max(50).optional().nullable(),
  imageUrl: z.string().url('La URL de la imagen debe ser valida').optional().nullable(),
  isActive: z.boolean().optional().default(true),
  categoryId: z.string().uuid('ID de categoria invalido').optional().nullable(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2, 'El nombre del producto debe tener al menos 2 caracteres').max(150).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  price: z.number().positive('El precio debe ser un valor positivo').optional(),
  sku: z.string().trim().max(50).optional().nullable(),
  imageUrl: z.string().url('La URL de la imagen debe ser valida').optional().nullable(),
  isActive: z.boolean().optional(),
  categoryId: z.string().uuid('ID de categoria invalido').optional().nullable(),
});

export const productQuerySchema = z.object({
  categoryId: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
  search: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
