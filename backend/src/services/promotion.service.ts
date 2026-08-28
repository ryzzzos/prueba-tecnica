import { DiscountType, PromotionStatus } from '@prisma/client';
import { IPromotionRepository, promotionRepository, PromotionWithRelations } from '../repositories/promotion.repository.js';
import { ICategoryRepository, categoryRepository } from '../repositories/category.repository.js';
import { IProductRepository, productRepository } from '../repositories/product.repository.js';
import {
  CreatePromotionInput,
  UpdatePromotionInput,
  PromotionQueryInput,
} from '../schemas/promotion.schema.js';
import { AppError } from '../middlewares/errorHandler.js';

export type PromotionResponseDto = PromotionWithRelations & {
  isValidToday: boolean;
};

export class PromotionService {
  constructor(
    private readonly promoRepo: IPromotionRepository = promotionRepository,
    private readonly catRepo: ICategoryRepository = categoryRepository,
    private readonly prodRepo: IProductRepository = productRepository
  ) {}

  public computeStatusFromDates(startDate: Date, endDate: Date): PromotionStatus {
    const now = new Date();
    if (endDate < now) {
      return PromotionStatus.FINISHED;
    }
    if (startDate <= now && endDate >= now) {
      return PromotionStatus.ACTIVE;
    }
    return PromotionStatus.PROGRAMMED;
  }

  private isPromotionValidToday(promo: { status: PromotionStatus; startDate: Date; endDate: Date }): boolean {
    if (promo.status !== PromotionStatus.ACTIVE) {
      return false;
    }
    const now = new Date();
    return promo.startDate <= now && promo.endDate >= now;
  }

  private mapToDto(promo: PromotionWithRelations): PromotionResponseDto {
    return {
      ...promo,
      isValidToday: this.isPromotionValidToday(promo),
    };
  }

  /**
   * Helper to collect all Product IDs covered by a set of category IDs and product IDs
   */
  private async getCoveredProductIds(categoryIds: string[], productIds: string[]): Promise<Set<string>> {
    const productIdSet = new Set<string>(productIds);

    if (categoryIds.length > 0) {
      const allProducts = await this.prodRepo.findAll();
      for (const prod of allProducts) {
        if (prod.categoryId && categoryIds.includes(prod.categoryId)) {
          productIdSet.add(prod.id);
        }
      }
    }

    return productIdSet;
  }

  /**
   * Enforces business rule: "Un producto no puede tener varios descuentos simultáneos"
   */
  private async validateNoOverlappingDiscounts(
    startDate: Date,
    endDate: Date,
    categoryIds: string[],
    productIds: string[],
    excludePromotionId?: string
  ): Promise<void> {
    const targetProductIds = await this.getCoveredProductIds(categoryIds, productIds);
    if (targetProductIds.size === 0) return;

    // Find any existing Active or Programmed promotions that overlap in time
    const overlappingPromotions = await this.promoRepo.findActiveAndProgrammedInRange(
      startDate,
      endDate,
      excludePromotionId
    );

    if (overlappingPromotions.length === 0) return;

    const allProducts = await this.prodRepo.findAll();
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    for (const existingPromo of overlappingPromotions) {
      const existingCatIds = existingPromo.categories.map((c) => c.id);
      if (existingPromo.categoryId && !existingCatIds.includes(existingPromo.categoryId)) {
        existingCatIds.push(existingPromo.categoryId);
      }

      const existingProdIds = existingPromo.products.map((p) => p.id);
      if (existingPromo.productId && !existingProdIds.includes(existingPromo.productId)) {
        existingProdIds.push(existingPromo.productId);
      }

      const coveredByExisting = await this.getCoveredProductIds(existingCatIds, existingProdIds);

      // Check intersection
      for (const prodId of targetProductIds) {
        if (coveredByExisting.has(prodId)) {
          const product = productMap.get(prodId);
          const productName = product ? product.name : 'seleccionado';
          throw new AppError(
            `El producto "${productName}" ya cuenta con el descuento "${existingPromo.name}" en ese período de fechas. Un producto no puede tener más de una promoción simultánea.`,
            400
          );
        }
      }
    }
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
    const scopeType = data.scopeType || 'CATEGORY';

    const categoryIds = data.categoryIds && data.categoryIds.length > 0
      ? data.categoryIds
      : data.categoryId ? [data.categoryId] : [];

    const productIds = data.productIds && data.productIds.length > 0
      ? data.productIds
      : data.productId ? [data.productId] : [];

    // 1. Verify categories exist if provided
    for (const catId of categoryIds) {
      const category = await this.catRepo.findById(catId);
      if (!category) {
        throw new AppError(`La categoria con ID ${catId} no existe en el sistema`, 404);
      }
    }

    // 2. Verify products exist if provided
    for (const prodId of productIds) {
      const product = await this.prodRepo.findById(prodId);
      if (!product) {
        throw new AppError(`El producto con ID ${prodId} no existe en el sistema`, 404);
      }
    }

    // 3. Validate date range
    if (data.endDate <= data.startDate) {
      throw new AppError('La fecha de fin debe ser posterior a la fecha de inicio', 400);
    }

    // 4. Validate discount rules
    if (data.discountType === DiscountType.PERCENTAGE) {
      if (data.discountValue < 1 || data.discountValue > 100) {
        throw new AppError('El valor del porcentaje debe estar entre 1 y 100', 400);
      }
    } else if (data.discountValue <= 0) {
      throw new AppError('El valor del monto fijo debe ser mayor a 0', 400);
    }

    // 5. Enforce single active discount per product (No overlap)
    await this.validateNoOverlappingDiscounts(
      data.startDate,
      data.endDate,
      categoryIds,
      productIds
    );

    // 6. Automatically compute status based on validity dates
    const computedStatus = this.computeStatusFromDates(data.startDate, data.endDate);
    const createData: CreatePromotionInput = {
      ...data,
      scopeType,
      categoryIds,
      productIds,
      categoryId: categoryIds[0] || null,
      productId: productIds[0] || null,
      status: computedStatus,
    };

    const created = await this.promoRepo.create(createData);
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

    const now = new Date();
    // Validate manual activation: cannot activate if already past endDate
    if (newStatus === PromotionStatus.ACTIVE && existing.endDate < now) {
      throw new AppError('No se puede activar una promocion cuya fecha de vigencia ya expiro', 400);
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

    const categoryIds = data.categoryIds !== undefined
      ? data.categoryIds
      : data.categoryId !== undefined
        ? data.categoryId ? [data.categoryId] : []
        : existing.categories.map((c) => c.id);

    const productIds = data.productIds !== undefined
      ? data.productIds
      : data.productId !== undefined
        ? data.productId ? [data.productId] : []
        : existing.products.map((p) => p.id);

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

    // Enforce single active discount per product (No overlap)
    await this.validateNoOverlappingDiscounts(
      startDate,
      endDate,
      categoryIds,
      productIds,
      id
    );

    // Automatically recalculate status based on dates when dates change
    let statusToUpdate = data.status;
    if (data.startDate !== undefined || data.endDate !== undefined) {
      statusToUpdate = this.computeStatusFromDates(startDate, endDate);
    }

    const updatePayload: UpdatePromotionInput = {
      ...data,
      categoryIds,
      productIds,
      categoryId: categoryIds[0] || null,
      productId: productIds[0] || null,
      ...(statusToUpdate !== undefined ? { status: statusToUpdate } : {}),
    };

    const updated = await this.promoRepo.update(id, updatePayload);
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
