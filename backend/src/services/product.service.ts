import { IProductRepository, productRepository, ProductWithCategory } from '../repositories/product.repository.js';
import { ICategoryRepository, categoryRepository } from '../repositories/category.repository.js';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../schemas/product.schema.js';
import { AppError } from '../middlewares/errorHandler.js';

export class ProductService {
  constructor(
    private readonly productRepo: IProductRepository = productRepository,
    private readonly categoryRepo: ICategoryRepository = categoryRepository
  ) {}

  async getAllProducts(query?: ProductQueryInput): Promise<ProductWithCategory[]> {
    return this.productRepo.findAll(query);
  }

  async getProductById(id: string): Promise<ProductWithCategory> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new AppError('Producto no encontrado', 404);
    }
    return product;
  }

  async createProduct(data: CreateProductInput): Promise<ProductWithCategory> {
    // 1. Verify category if provided
    if (data.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) {
        throw new AppError('La categoria seleccionada no existe en el sistema', 404);
      }
    }

    // 2. Verify SKU uniqueness if provided
    if (data.sku) {
      const existingSku = await this.productRepo.findBySku(data.sku);
      if (existingSku) {
        throw new AppError('Ya existe un producto con este codigo SKU', 409);
      }
    }

    // 3. Price validation
    if (data.price <= 0) {
      throw new AppError('El precio del producto debe ser mayor a 0', 400);
    }

    return this.productRepo.create(data);
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<ProductWithCategory> {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new AppError('Producto no encontrado', 404);
    }

    // If changing category, verify category exists
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) {
        throw new AppError('La nueva categoria seleccionada no existe en el sistema', 404);
      }
    }

    // If changing SKU, verify uniqueness
    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await this.productRepo.findBySku(data.sku);
      if (existingSku) {
        throw new AppError('Ya existe un producto con este codigo SKU', 409);
      }
    }

    if (data.price !== undefined && data.price <= 0) {
      throw new AppError('El precio del producto debe ser mayor a 0', 400);
    }

    return this.productRepo.update(id, data);
  }

  async toggleProductActive(id: string, isActive: boolean): Promise<ProductWithCategory> {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new AppError('Producto no encontrado', 404);
    }

    return this.productRepo.toggleActive(id, isActive);
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new AppError('Producto no encontrado', 404);
    }

    await this.productRepo.delete(id);
    return {
      success: true,
      message: `Producto "${existing.name}" eliminado correctamente`,
    };
  }

  async getMetrics(): Promise<{
    total: number;
    activeCount: number;
    categoriesCount: number;
    minPrice: number;
    maxPrice: number;
  }> {
    return this.productRepo.getMetrics();
  }
}

export const productService = new ProductService();
