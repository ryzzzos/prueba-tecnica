import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { ProductService } from '../src/services/product.service.js';
import { IProductRepository, ProductWithCategory } from '../src/repositories/product.repository.js';
import { ICategoryRepository } from '../src/repositories/category.repository.js';
import { AppError } from '../src/middlewares/errorHandler.js';

describe('ProductService Unit Tests', () => {
  let prodRepoMock: IProductRepository;
  let catRepoMock: ICategoryRepository;
  let service: ProductService;

  const mockCategory = {
    id: 'cat-uuid-1',
    name: 'Bebidas',
    description: 'Bebidas frias',
    position: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockProduct = (overrides: Partial<ProductWithCategory> = {}): ProductWithCategory => {
    const now = new Date();
    return {
      id: 'prod-uuid-1',
      name: 'Coca Cola 1.5L',
      description: 'Gaseosa sin azucar',
      price: new Prisma.Decimal(4500),
      sku: 'BEB-001',
      imageUrl: 'https://example.com/coca.jpg',
      isActive: true,
      categoryId: mockCategory.id,
      category: { id: mockCategory.id, name: mockCategory.name },
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  };

  beforeEach(() => {
    prodRepoMock = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findBySku: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      toggleActive: vi.fn(),
      delete: vi.fn(),
      getMetrics: vi.fn(),
    };

    catRepoMock = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = new ProductService(prodRepoMock, catRepoMock);
  });

  describe('createProduct', () => {
    it('should create product successfully when valid', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);
      vi.spyOn(prodRepoMock, 'findBySku').mockResolvedValue(null);
      const mockCreated = createMockProduct();
      vi.spyOn(prodRepoMock, 'create').mockResolvedValue(mockCreated);

      const input = {
        name: 'Coca Cola 1.5L',
        description: 'Gaseosa sin azucar',
        price: 4500,
        sku: 'BEB-001',
        imageUrl: 'https://example.com/coca.jpg',
        isActive: true,
        categoryId: mockCategory.id,
      };

      const result = await service.createProduct(input);

      expect(catRepoMock.findById).toHaveBeenCalledWith(mockCategory.id);
      expect(prodRepoMock.findBySku).toHaveBeenCalledWith('BEB-001');
      expect(prodRepoMock.create).toHaveBeenCalledWith(input);
      expect(result.id).toBe(mockCreated.id);
    });

    it('should throw error if category does not exist', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(null);

      const input = {
        name: 'Coca Cola 1.5L',
        price: 4500,
        categoryId: 'non-existent-cat',
      };

      await expect(service.createProduct(input)).rejects.toThrow(
        new AppError('La categoria seleccionada no existe en el sistema', 404)
      );
    });

    it('should throw error if SKU is duplicated', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);
      vi.spyOn(prodRepoMock, 'findBySku').mockResolvedValue(createMockProduct());

      const input = {
        name: 'Otro Producto',
        price: 3000,
        sku: 'BEB-001',
        categoryId: mockCategory.id,
      };

      await expect(service.createProduct(input)).rejects.toThrow(
        new AppError('Ya existe un producto con este codigo SKU', 409)
      );
    });

    it('should throw error if price is 0 or negative', async () => {
      vi.spyOn(catRepoMock, 'findById').mockResolvedValue(mockCategory);
      vi.spyOn(prodRepoMock, 'findBySku').mockResolvedValue(null);

      const input = {
        name: 'Producto Gratis Invalido',
        price: 0,
        categoryId: mockCategory.id,
      };

      await expect(service.createProduct(input)).rejects.toThrow(
        new AppError('El precio del producto debe ser mayor a 0', 400)
      );
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const existing = createMockProduct();
      vi.spyOn(prodRepoMock, 'findById').mockResolvedValue(existing);
      vi.spyOn(prodRepoMock, 'update').mockResolvedValue({
        ...existing,
        name: 'Coca Cola Zero 1.5L',
      });

      const result = await service.updateProduct('prod-uuid-1', {
        name: 'Coca Cola Zero 1.5L',
      });

      expect(prodRepoMock.update).toHaveBeenCalledWith('prod-uuid-1', {
        name: 'Coca Cola Zero 1.5L',
      });
      expect(result.name).toBe('Coca Cola Zero 1.5L');
    });

    it('should throw error if updating non-existent product', async () => {
      vi.spyOn(prodRepoMock, 'findById').mockResolvedValue(null);

      await expect(
        service.updateProduct('non-existent', { name: 'Test' })
      ).rejects.toThrow(new AppError('Producto no encontrado', 404));
    });
  });

  describe('toggleProductActive', () => {
    it('should toggle active state successfully', async () => {
      const existing = createMockProduct({ isActive: true });
      vi.spyOn(prodRepoMock, 'findById').mockResolvedValue(existing);
      vi.spyOn(prodRepoMock, 'toggleActive').mockResolvedValue({
        ...existing,
        isActive: false,
      });

      const result = await service.toggleProductActive('prod-uuid-1', false);

      expect(prodRepoMock.toggleActive).toHaveBeenCalledWith('prod-uuid-1', false);
      expect(result.isActive).toBe(false);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const existing = createMockProduct();
      vi.spyOn(prodRepoMock, 'findById').mockResolvedValue(existing);
      vi.spyOn(prodRepoMock, 'delete').mockResolvedValue(existing);

      const result = await service.deleteProduct('prod-uuid-1');

      expect(prodRepoMock.delete).toHaveBeenCalledWith('prod-uuid-1');
      expect(result.success).toBe(true);
    });
  });
});
