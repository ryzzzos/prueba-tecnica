import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiscountType, PromotionStatus, Prisma } from '@prisma/client';
import { PromotionService } from '../src/services/promotion.service.js';
import { IPromotionRepository, PromotionWithCategory } from '../src/repositories/promotion.repository.js';
import { ICategoryRepository } from '../src/repositories/category.repository.js';
import { AppError } from '../src/middlewares/errorHandler.js';

describe('PromotionService Unit Tests', () => {
  let promoRepoMock: IPromotionRepository;
  let catRepoMock: ICategoryRepository;
  let service: PromotionService;

  const mockCategory = {
    id: 'cat-uuid-1',
    name: 'Bebidas',
    description: 'Bebidas frias',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockPromotion = (overrides: Partial<PromotionWithCategory> = {}): PromotionWithCategory => {
    const now = new Date();
    return {
      id: 'promo-uuid-1',
      name: 'Promocion Refrescos',
      categoryId: mockCategory.id,
      category: { id: mockCategory.id, name: mockCategory.name },
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
    };

    service = new PromotionService(promoRepoMock, catRepoMock);
  });

  describe('createPromotion', () => {
    it('should create a promotion successfully with percentage discount between 1 and 100', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);
      const mockCreated = createMockPromotion();
      vi.spyOn(promoRepoMock, 'create').mockResolvedValue(mockCreated);

      const now = new Date();
      const input = {
        name: 'Super Descuento 20%',
        categoryId: mockCategory.id,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        startDate: now,
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: PromotionStatus.PROGRAMMED,
      };

      const result = await service.createPromotion(input);

      expect(catRepoMock.findById).toHaveBeenCalledWith(mockCategory.id);
      expect(promoRepoMock.create).toHaveBeenCalledWith(input);
      expect(result.id).toBe(mockCreated.id);
      expect(result.isValidToday).toBe(false); // Because status is PROGRAMMED
    });

    it('should throw an error if category does not exist', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(null);

      const now = new Date();
      const input = {
        name: 'Promo Fantasma',
        categoryId: 'non-existent-cat',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 500,
        startDate: now,
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: PromotionStatus.PROGRAMMED,
      };

      await expect(service.createPromotion(input)).rejects.toThrow(
        new AppError('La categoria seleccionada no existe en el sistema', 404)
      );
    });

    it('should throw an error if endDate is prior to or equal to startDate', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);

      const now = new Date();
      const input = {
        name: 'Promo Fechas Invalidas',
        categoryId: mockCategory.id,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: now, // Invalid: endDate before startDate
        status: PromotionStatus.PROGRAMMED,
      };

      await expect(service.createPromotion(input)).rejects.toThrow(
        new AppError('La fecha de fin debe ser posterior a la fecha de inicio', 400)
      );
    });

    it('should throw an error if percentage discount is greater than 100', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);

      const now = new Date();
      const input = {
        name: 'Descuento 150%',
        categoryId: mockCategory.id,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 150, // Invalid: > 100
        startDate: now,
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: PromotionStatus.PROGRAMMED,
      };

      await expect(service.createPromotion(input)).rejects.toThrow(
        new AppError('El valor del porcentaje debe estar entre 1 y 100', 400)
      );
    });

    it('should throw an error if fixed amount discount is 0 or negative', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);

      const now = new Date();
      const input = {
        name: 'Descuento Monto Invalido',
        categoryId: mockCategory.id,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 0, // Invalid
        startDate: now,
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: PromotionStatus.PROGRAMMED,
      };

      await expect(service.createPromotion(input)).rejects.toThrow(
        new AppError('El valor del monto fijo debe ser mayor a 0', 400)
      );
    });
  });

  describe('changePromotionStatus', () => {
    it('should allow changing status from PROGRAMMED to ACTIVE', async () => {
      const existing = createMockPromotion({ status: PromotionStatus.PROGRAMMED });
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

  describe('updatePromotion (Immutability rule)', () => {
    it('should reject update if the promotion is in FINISHED state', async () => {
      const finishedPromo = createMockPromotion({ status: PromotionStatus.FINISHED });
      vi.spyOn(promoRepoMock, 'findById').mockResolvedValue(finishedPromo);

      await expect(
        service.updatePromotion('promo-uuid-1', { name: 'Nuevo Nombre Intento' })
      ).rejects.toThrow(new AppError('Una promocion en estado Finalizada no puede modificarse', 400));
    });
  });

  describe('deletePromotion (Deletion restrictions)', () => {
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
      expect(promoRepoMock.delete).not.toHaveBeenCalled();
    });

    it('should throw an error when attempting to delete a FINISHED promotion', async () => {
      const finishedPromo = createMockPromotion({ status: PromotionStatus.FINISHED });
      vi.spyOn(promoRepoMock, 'findById').mockResolvedValue(finishedPromo);

      await expect(service.deletePromotion('promo-uuid-1')).rejects.toThrow(
        new AppError(
          'Solo se pueden eliminar promociones en estado Programada. La promocion actual se encuentra en estado FINISHED',
          400
        )
      );
      expect(promoRepoMock.delete).not.toHaveBeenCalled();
    });
  });

  describe('getSummaryMetrics & isValidToday dynamic calculation', () => {
    it('should return metrics summary matching repository values', async () => {
      const summaryData = {
        total: 10,
        programmed: 3,
        active: 5,
        finished: 2,
        validToday: 4,
      };
      vi.spyOn(promoRepoMock, 'getMetricsSummary').mockResolvedValue(summaryData);

      const result = await service.getSummaryMetrics();

      expect(result).toEqual(summaryData);
    });

    it('should compute isValidToday = true only if status is ACTIVE and current date is within date range', async () => {
      const now = new Date();
      const activeAndValidPromo = createMockPromotion({
        status: PromotionStatus.ACTIVE,
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      });
      vi.spyOn(promoRepoMock, 'findById').mockResolvedValue(activeAndValidPromo);

      const result = await service.getPromotionById('promo-uuid-1');
      expect(result.isValidToday).toBe(true);
    });

    it('should compute isValidToday = false if status is ACTIVE but date is expired', async () => {
      const now = new Date();
      const expiredPromo = createMockPromotion({
        status: PromotionStatus.ACTIVE,
        startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Expired 2 days ago
      });
      vi.spyOn(promoRepoMock, 'findById').mockResolvedValue(expiredPromo);

      const result = await service.getPromotionById('promo-uuid-1');
      expect(result.isValidToday).toBe(false);
    });
  });
});
