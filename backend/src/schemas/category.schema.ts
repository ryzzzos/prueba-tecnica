import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'El nombre de la categoria debe tener al menos 2 caracteres').max(100),
  description: z.string().trim().max(500).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
