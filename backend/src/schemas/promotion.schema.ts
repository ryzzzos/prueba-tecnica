import { z } from 'zod';
import { DiscountType, PromotionStatus } from '@prisma/client';

export const DiscountTypeEnum = z.nativeEnum(DiscountType, {
  errorMap: () => ({ message: 'Tipo de descuento invalido. Opciones: PERCENTAGE, FIXED_AMOUNT' }),
});

export const PromotionStatusEnum = z.nativeEnum(PromotionStatus, {
  errorMap: () => ({ message: 'Estado de promocion invalido. Opciones: PROGRAMMED, ACTIVE, FINISHED' }),
});

export const createPromotionSchema = z
  .object({
    name: z
      .string({ required_error: 'El nombre de la promocion es obligatorio' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(150, 'El nombre no puede exceder 150 caracteres'),
    categoryId: z
      .string({ required_error: 'La categoria asociada es obligatoria' })
      .uuid('El ID de la categoria debe ser un UUID valido'),
    discountType: DiscountTypeEnum,
    discountValue: z
      .number({ required_error: 'El valor del descuento es obligatorio' })
      .positive('El valor del descuento debe ser mayor a 0'),
    startDate: z.coerce.date({ required_error: 'La fecha de inicio es obligatoria' }),
    endDate: z.coerce.date({ required_error: 'La fecha de fin es obligatoria' }),
    status: PromotionStatusEnum.optional().default(PromotionStatus.PROGRAMMED),
  })
  .superRefine((data, ctx) => {
    // Validation: endDate must be strictly after startDate
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['endDate'],
      });
    }

    // Validation: Percentage must be between 1 and 100
    if (data.discountType === DiscountType.PERCENTAGE) {
      if (data.discountValue < 1 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Para descuentos de tipo porcentaje, el valor debe estar entre 1 y 100',
          path: ['discountValue'],
        });
      }
    }
  });

export const updatePromotionSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    categoryId: z.string().uuid().optional(),
    discountType: DiscountTypeEnum.optional(),
    discountValue: z.number().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: PromotionStatusEnum.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['endDate'],
      });
    }

    if (data.discountType === DiscountType.PERCENTAGE && data.discountValue !== undefined) {
      if (data.discountValue < 1 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Para descuentos de tipo porcentaje, el valor debe estar entre 1 y 100',
          path: ['discountValue'],
        });
      }
    }
  });

export const changePromotionStatusSchema = z.object({
  status: PromotionStatusEnum,
});

export const promotionQuerySchema = z.object({
  status: PromotionStatusEnum.optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type ChangePromotionStatusInput = z.infer<typeof changePromotionStatusSchema>;
export type PromotionQueryInput = z.infer<typeof promotionQuerySchema>;
