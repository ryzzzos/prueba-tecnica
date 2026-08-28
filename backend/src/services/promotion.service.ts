import { DiscountType, PromotionStatus } from '@prisma/client';
import { IPromotionRepository, promotionRepository, PromotionWithCategory } from '../repositories/promotion.repository.js';
import { ICategoryRepository, categoryRepository } from '../repositories/category.repository.js';
import {
  CreatePromotionInput,
  UpdatePromotionInput,
  PromotionQueryInput,
} from '../schemas/promotion.schema.js';
import { AppError } from '../middlewares/errorHandler.js';

export type PromotionResponseDto = PromotionWithCategory & {
  isValidToday: boolean;
};

export class PromotionService {
  constructor(
    private readonly promoRepo: IPromotionRepository = promotionRepository,
    private readonly catRepo: ICategoryRepository = categoryRepository
  ) {}

  private isPromotionValidToday(promo: { status: PromotionStatus; startDate: Date; endDate: Date }): boolean {
    if (promo.status !== PromotionStatus.ACTIVE) {
      return false;
    }
    const now = new Date();
    return promo.startDate <= now && promo.endDate >= now;
  }

  private mapToDto(promo: PromotionWithCategory): PromotionResponseDto {
    return {
      ...promo,
      isValidToday: this.isPromotionValidToday(promo),
    };
  }

  async getAllPromotions(query?: PromotionQueryInput): Promise<PromotionResponseDto[]> {
    const promotions = await this.promoRepo.findAll(query);
    return promotions.map((p) => this.mapToDto(p));
  }

  async getPromotionById(id: string): Promise<PromotionResponseDto> {
    const promotion = await this.promoRepo.findById(id);
    if (!promotion) {
      throw new AppError('Promocion no encontrada', 404);
    }
    return this.mapToDto(promotion);
  }

  async createPromotion(data: CreatePromotionInput): Promise<PromotionResponseDto> {
    // 1. Verify category exists
    const category = await this.catRepo.findById(data.categoryId);
    if (!category) {
      throw new AppError('La categoria seleccionada no existe en el sistema', 404);
    }

    // 2. Validate date range
    if (data.endDate <= data.startDate) {
      throw new AppError('La fecha de fin debe ser posterior a la fecha de inicio', 400);
    }

    // 3. Validate discount rules
    if (data.discountType === DiscountType.PERCENTAGE) {
      if (data.discountValue < 1 || data.discountValue > 100) {
        throw new AppError('El valor del porcentaje debe estar entre 1 y 100', 400);
      }
    } else if (data.discountValue <= 0) {
      throw new AppError('El valor del monto fijo debe ser mayor a 0', 400);
    }

    const created = await this.promoRepo.create(data);
    return this.mapToDto(created);
  }

  async changePromotionStatus(id: string, newStatus: PromotionStatus): Promise<PromotionResponseDto> {
    const existing = await this.promoRepo.findById(id);
    if (!existing) {
      throw new AppError('Promocion no encontrada', 404);
    }

    // Rule: Finished promotions cannot be modified or transitioned
    if (existing.status === PromotionStatus.FINISHED) {
      throw new AppError('Una promocion en estado Finalizada no puede modificarse ni cambiar de estado', 400);
    }

    // Validate state machine transitions
    if (existing.status === newStatus) {
      return this.mapToDto(existing);
    }

    const updated = await this.promoRepo.update(id, { status: newStatus });
    return this.mapToDto(updated);
  }

  async updatePromotion(id: string, data: UpdatePromotionInput): Promise<PromotionResponseDto> {
    const existing = await this.promoRepo.findById(id);
    if (!existing) {
      throw new AppError('Promocion no encontrada', 404);
    }

    // Rule: Finished promotions cannot be modified
    if (existing.status === PromotionStatus.FINISHED) {
      throw new AppError('Una promocion en estado Finalizada no puede modificarse', 400);
    }

    // If changing category, verify target category exists
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await this.catRepo.findById(data.categoryId);
      if (!category) {
        throw new AppError('La nueva categoria seleccionada no existe en el sistema', 404);
      }
    }

    // Validate dates if either is being modified
    const startDate = data.startDate ?? existing.startDate;
    const endDate = data.endDate ?? existing.endDate;
    if (endDate <= startDate) {
      throw new AppError('La fecha de fin debe ser posterior a la fecha de inicio', 400);
    }

    // Validate discount value and type
    const discountType = data.discountType ?? existing.discountType;
    const discountValue = data.discountValue ?? Number(existing.discountValue);

    if (discountType === DiscountType.PERCENTAGE) {
      if (discountValue < 1 || discountValue > 100) {
        throw new AppError('El valor del porcentaje debe estar entre 1 y 100', 400);
      }
    } else if (discountValue <= 0) {
      throw new AppError('El valor del monto fijo debe ser mayor a 0', 400);
    }

    const updated = await this.promoRepo.update(id, data);
    return this.mapToDto(updated);
  }

  async deletePromotion(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.promoRepo.findById(id);
    if (!existing) {
      throw new AppError('Promocion no encontrada', 404);
    }

    // Rule: Can ONLY delete if in PROGRAMMED status
    if (existing.status !== PromotionStatus.PROGRAMMED) {
      throw new AppError(
        `Solo se pueden eliminar promociones en estado Programada. La promocion actual se encuentra en estado ${existing.status}`,
        400
      );
    }

    await this.promoRepo.delete(id);
    return {
      success: true,
      message: 'Promocion eliminada exitosamente',
    };
  }

  async getSummaryMetrics(): Promise<{
    total: number;
    programmed: number;
    active: number;
    finished: number;
    validToday: number;
  }> {
    return this.promoRepo.getMetricsSummary();
  }
}

export const promotionService = new PromotionService();
