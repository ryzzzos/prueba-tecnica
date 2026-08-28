import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiscountType, PromotionStatus, Prisma } from '@prisma/client';
import { PromotionService } from '../src/services/promotion.service.js';
import { IPromotionRepository, PromotionWithRelations } from '../src/repositories/promotion.repository.js';
import { ICategoryRepository } from '../src/repositories/category.repository.js';
import { IProductRepository } from '../src/repositories/product.repository.js';
import { AppError } from '../src/middlewares/errorHandler.js';

describe('PromotionService Unit Tests', () => {
  let promoRepoMock: IPromotionRepository;
  let catRepoMock: ICategoryRepository;
  let prodRepoMock: IProductRepository;
  let service: PromotionService;

  const mockCategory = {
    id: 'cat-uuid-1',
    name: 'Bebidas',
    description: 'Bebidas frias',
    position: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockPromotion = (overrides: Partial<PromotionWithRelations> = {}): PromotionWithRelations => {
    const now = new Date();
    return {
      id: 'promo-uuid-1',
      name: 'Promocion Refrescos',
      scopeType: 'CATEGORY',
      categoryId: mockCategory.id,
      category: { id: mockCategory.id, name: mockCategory.name },
      productId: null,
      product: null,
      categories: [{ id: mockCategory.id, name: mockCategory.name }],
      products: [],
      discountType: DiscountType.PERCENTAGE,
      discountValue: new Prisma.Decimal(20),
      startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Ayer
      endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Manana
      status: PromotionStatus.PROGRAMMED,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  };

  beforeEach(() => {
    promoRepoMock = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findActiveAndProgrammedInRange: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getMetricsSummary: vi.fn(),
    };

    catRepoMock = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    prodRepoMock = {
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      findBySku: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      toggleActive: vi.fn(),
      delete: vi.fn(),
      getMetrics: vi.fn(),
    };

    service = new PromotionService(promoRepoMock, catRepoMock, prodRepoMock);
  });

  describe('createPromotion', () => {
    it('should create a promotion with ACTIVE status if dates are currently effective', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);
      const mockCreated = createMockPromotion({ status: PromotionStatus.ACTIVE });
      vi.spyOn(promoRepoMock, 'create').mockResolvedValue(mockCreated);

      const now = new Date();
      const input = {
        name: 'Super Descuento 20%',
        scopeType: 'CATEGORY' as const,
        categoryId: mockCategory.id,
        categoryIds: [mockCategory.id],
        productIds: [],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        startDate: new Date(now.getTime() - 1000), // Inicia hace 1 segundo
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: PromotionStatus.PROGRAMMED,
      };

      const result = await service.createPromotion(input);

      expect(catRepoMock.findById).toHaveBeenCalledWith(mockCategory.id);
      expect(result.id).toBe(mockCreated.id);
    });

    it('should throw an error if a product already has an active overlapping discount', async () => {
      const mockProduct = {
        id: 'prod-uuid-1',
        name: 'Coca Cola 1.5L',
        price: new Prisma.Decimal(4500),
        sku: 'BEB-001',
        imageUrl: null,
        isActive: true,
        categoryId: mockCategory.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);
      vi.spyOn(prodRepoMock, 'findById').mockResolvedValue(mockProduct);
      vi.spyOn(prodRepoMock, 'findAll').mockResolvedValue([mockProduct]);

      const now = new Date();
      const existingPromo = createMockPromotion({
        id: 'existing-promo',
        name: 'Descuento Activo de Gaseosas',
        products: [{ ...mockProduct, categoryId: mockCategory.id }],
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        status: PromotionStatus.ACTIVE,
      });

      vi.spyOn(promoRepoMock, 'findActiveAndProgrammedInRange').mockResolvedValue([existingPromo]);

      const input = {
        name: 'Nuevo Descuento Coca Cola',
        scopeType: 'PRODUCT' as const,
        productIds: [mockProduct.id],
        categoryIds: [],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 25,
        startDate: new Date(now.getTime() - 1000),
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        status: PromotionStatus.PROGRAMMED,
      };

      await expect(service.createPromotion(input)).rejects.toThrow(
        /ya cuenta con el descuento/
      );
    });

    it('should throw an error if category does not exist', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(null);

      const now = new Date();
      const input = {
        name: 'Promo Fantasma',
        scopeType: 'CATEGORY' as const,
        categoryId: 'non-existent-cat',
        categoryIds: ['non-existent-cat'],
        productIds: [],
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 500,
        startDate: now,
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: PromotionStatus.PROGRAMMED,
      };

      await expect(service.createPromotion(input)).rejects.toThrow(
        /no existe en el sistema/
      );
    });

    it('should throw an error if endDate is prior to or equal to startDate', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);

      const now = new Date();
      const input = {
        name: 'Promo Fechas Invalidas',
        scopeType: 'CATEGORY' as const,
        categoryId: mockCategory.id,
        categoryIds: [mockCategory.id],
        productIds: [],
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: now, // Invalid
        status: PromotionStatus.PROGRAMMED,
      };

      await expect(service.createPromotion(input)).rejects.toThrow(
        new AppError('La fecha de fin debe ser posterior a la fecha de inicio', 400)
      );
    });
  });

  describe('changePromotionStatus', () => {
    it('should allow changing status from PROGRAMMED to ACTIVE when promotion is not expired', async () => {
      const now = new Date();
      const existing = createMockPromotion({
        status: PromotionStatus.PROGRAMMED,
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      });
      const updated = { ...existing, status: PromotionStatus.ACTIVE };

      vi.spyOn(promoRepoMock, 'findById').mockResolvedValue(existing);
      vi.spyOn(promoRepoMock, 'update').mockResolvedValue(updated);

      const result = await service.changePromotionStatus('promo-uuid-1', PromotionStatus.ACTIVE);

      expect(promoRepoMock.update).toHaveBeenCalledWith('promo-uuid-1', { status: PromotionStatus.ACTIVE });
      expect(result.status).toBe(PromotionStatus.ACTIVE);
    });

    it('should throw an error when attempting to change status of a FINISHED promotion', async () => {
      const finishedPromo = createMockPromotion({ status: PromotionStatus.FINISHED });
      vi.spyOn(promoRepoMock, 'findById').mockResolvedValue(finishedPromo);

      await expect(service.changePromotionStatus('promo-uuid-1', PromotionStatus.ACTIVE)).rejects.toThrow(
        new AppError('Una promocion en estado Finalizada no puede modificarse ni cambiar de estado', 400)
      );
    });
  });

  describe('deletePromotion', () => {
    it('should allow deleting a promotion when its status is PROGRAMMED', async () => {
      const programmedPromo = createMockPromotion({ status: PromotionStatus.PROGRAMMED });
      vi.spyOn(promoRepoMock, 'findById').mockResolvedValue(programmedPromo);
      vi.spyOn(promoRepoMock, 'delete').mockResolvedValue(programmedPromo);

      const result = await service.deletePromotion('promo-uuid-1');

      expect(promoRepoMock.delete).toHaveBeenCalledWith('promo-uuid-1');
      expect(result.success).toBe(true);
    });

    it('should throw an error when attempting to delete an ACTIVE promotion', async () => {
      const activePromo = createMockPromotion({ status: PromotionStatus.ACTIVE });
      vi.spyOn(promoRepoMock, 'findById').mockResolvedValue(activePromo);

      await expect(service.deletePromotion('promo-uuid-1')).rejects.toThrow(
        new AppError(
          'Solo se pueden eliminar promociones en estado Programada. La promocion actual se encuentra en estado ACTIVE',
          400
        )
      );
    });
  });
});
