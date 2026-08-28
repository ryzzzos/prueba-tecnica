import { Product, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../schemas/product.schema.js';

export type ProductWithCategory = Product & {
  category: {
    id: string;
    name: string;
  } | null;
};

export interface IProductRepository {
  findAll(query?: ProductQueryInput): Promise<ProductWithCategory[]>;
  findById(id: string): Promise<ProductWithCategory | null>;
  findBySku(sku: string): Promise<Product | null>;
  create(data: CreateProductInput): Promise<ProductWithCategory>;
  update(id: string, data: UpdateProductInput): Promise<ProductWithCategory>;
  toggleActive(id: string, isActive: boolean): Promise<ProductWithCategory>;
  delete(id: string): Promise<Product>;
  getMetrics(): Promise<{
    total: number;
    activeCount: number;
    categoriesCount: number;
    minPrice: number;
    maxPrice: number;
  }>;
}

export class ProductRepository implements IProductRepository {
  async findAll(query?: ProductQueryInput): Promise<ProductWithCategory[]> {
    const where: Prisma.ProductWhereInput = {};

    if (query?.status === 'active') {
      where.isActive = true;
    } else if (query?.status === 'inactive') {
      where.isActive = false;
    }

    if (query?.categoryId && query.categoryId !== 'all') {
      if (query.categoryId === 'null') {
        where.categoryId = null;
      } else {
        where.categoryId = query.categoryId;
      }
    }

    if (query?.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { category: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    return prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  async create(data: CreateProductInput): Promise<ProductWithCategory> {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        sku: data.sku || null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
        categoryId: data.categoryId || null,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateProductInput): Promise<ProductWithCategory> {
    const updateData: Prisma.ProductUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.sku !== undefined) updateData.sku = data.sku || null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.categoryId !== undefined) {
      if (data.categoryId === null) {
        updateData.category = { disconnect: true };
      } else {
        updateData.category = { connect: { id: data.categoryId } };
      }
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async toggleActive(id: string, isActive: boolean): Promise<ProductWithCategory> {
    return prisma.product.update({
      where: { id },
      data: { isActive },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }

  async getMetrics(): Promise<{
    total: number;
    activeCount: number;
    categoriesCount: number;
    minPrice: number;
    maxPrice: number;
  }> {
    const [total, activeCount, activeProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { price: true, categoryId: true },
      }),
    ]);

    const categoriesCount = new Set(
      activeProducts.map((p) => p.categoryId).filter((c): c is string => Boolean(c))
    ).size;

    const prices = activeProducts.map((p) => Number(p.price)).filter((n) => !isNaN(n));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      total,
      activeCount,
      categoriesCount,
      minPrice,
      maxPrice,
    };
  }
}

export const productRepository = new ProductRepository();
