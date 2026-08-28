import { Promotion, PromotionStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { CreatePromotionInput, UpdatePromotionInput, PromotionQueryInput } from '../schemas/promotion.schema.js';

export type PromotionWithRelations = Promotion & {
  category?: {
    id: string;
    name: string;
  } | null;
  product?: {
    id: string;
    name: string;
    price: Prisma.Decimal;
    imageUrl: string | null;
  } | null;
  categories: Array<{
    id: string;
    name: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    price: Prisma.Decimal;
    imageUrl: string | null;
    categoryId: string | null;
  }>;
};

export type PromotionWithCategory = PromotionWithRelations;

export interface IPromotionRepository {
  findAll(query?: PromotionQueryInput): Promise<PromotionWithRelations[]>;
  findById(id: string): Promise<PromotionWithRelations | null>;
  create(data: CreatePromotionInput): Promise<PromotionWithRelations>;
  update(id: string, data: UpdatePromotionInput): Promise<PromotionWithRelations>;
  delete(id: string): Promise<Promotion>;
  findActiveAndProgrammedInRange(startDate: Date, endDate: Date, excludeId?: string): Promise<PromotionWithRelations[]>;
  syncStatuses?(): Promise<void>;
  getMetricsSummary(): Promise<{
    total: number;
    programmed: number;
    active: number;
    finished: number;
    validToday: number;
  }>;
}

export class PromotionRepository implements IPromotionRepository {
  async syncStatuses(): Promise<void> {
    const now = new Date();
    try {
      // 1. Programmed promotions whose startDate has arrived and endDate not passed become ACTIVE
      await prisma.promotion.updateMany({
        where: {
          status: PromotionStatus.PROGRAMMED,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        data: {
          status: PromotionStatus.ACTIVE,
        },
      });

      // 2. Programmed or Active promotions whose endDate has expired become FINISHED
      await prisma.promotion.updateMany({
        where: {
          status: { in: [PromotionStatus.PROGRAMMED, PromotionStatus.ACTIVE] },
          endDate: { lt: now },
        },
        data: {
          status: PromotionStatus.FINISHED,
        },
      });
    } catch {
      // Graceful fallback if database update encounters transient issues
    }
  }

  async findAll(query?: PromotionQueryInput): Promise<PromotionWithRelations[]> {
    await this.syncStatuses();

    const where: Prisma.PromotionWhereInput = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.categoryId) {
      where.OR = [
        { categoryId: query.categoryId },
        { categories: { some: { id: query.categoryId } } },
      ];
    }

    if (query?.productId) {
      where.OR = [
        { productId: query.productId },
        { products: { some: { id: query.productId } } },
      ];
    }

    if (query?.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { product: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { categories: { some: { name: { contains: searchTerm, mode: 'insensitive' } } } },
        { products: { some: { name: { contains: searchTerm, mode: 'insensitive' } } } },
      ];
    }

    return prisma.promotion.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
        categories: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true, imageUrl: true, categoryId: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string): Promise<PromotionWithRelations | null> {
    return prisma.promotion.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
        categories: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true, imageUrl: true, categoryId: true } },
      },
    });
  }

  async findActiveAndProgrammedInRange(
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<PromotionWithRelations[]> {
    await this.syncStatuses();

    return prisma.promotion.findMany({
      where: {
        status: { in: [PromotionStatus.ACTIVE, PromotionStatus.PROGRAMMED] },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      include: {
        category: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
        categories: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true, imageUrl: true, categoryId: true } },
      },
    });
  }

  async create(data: CreatePromotionInput): Promise<PromotionWithRelations> {
    const scopeType = data.scopeType || 'CATEGORY';
    const categoryIds = data.categoryIds && data.categoryIds.length > 0
      ? data.categoryIds
      : data.categoryId ? [data.categoryId] : [];
    const productIds = data.productIds && data.productIds.length > 0
      ? data.productIds
      : data.productId ? [data.productId] : [];

    const primaryCategoryId = categoryIds[0] || null;
    const primaryProductId = productIds[0] || null;

    return prisma.promotion.create({
      data: {
        name: data.name,
        scopeType,
        categoryId: primaryCategoryId,
        productId: primaryProductId,
        categories: categoryIds.length > 0 ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
        products: productIds.length > 0 ? { connect: productIds.map((id) => ({ id })) } : undefined,
        discountType: data.discountType,
        discountValue: new Prisma.Decimal(data.discountValue),
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      },
      include: {
        category: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
        categories: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true, imageUrl: true, categoryId: true } },
      },
    });
  }

  async update(id: string, data: UpdatePromotionInput): Promise<PromotionWithRelations> {
    const updateData: Prisma.PromotionUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.scopeType !== undefined) updateData.scopeType = data.scopeType;

    if (data.categoryIds !== undefined) {
      updateData.categories = {
        set: data.categoryIds.map((cId) => ({ id: cId })),
      };
      updateData.category = data.categoryIds.length > 0
        ? { connect: { id: data.categoryIds[0] } }
        : { disconnect: true };
    } else if (data.categoryId !== undefined) {
      if (data.categoryId) {
        updateData.category = { connect: { id: data.categoryId } };
        updateData.categories = { set: [{ id: data.categoryId }] };
      } else {
        updateData.category = { disconnect: true };
      }
    }

    if (data.productIds !== undefined) {
      updateData.products = {
        set: data.productIds.map((pId) => ({ id: pId })),
      };
      updateData.product = data.productIds.length > 0
        ? { connect: { id: data.productIds[0] } }
        : { disconnect: true };
    } else if (data.productId !== undefined) {
      if (data.productId) {
        updateData.product = { connect: { id: data.productId } };
        updateData.products = { set: [{ id: data.productId }] };
      } else {
        updateData.product = { disconnect: true };
      }
    }

    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) {
      updateData.discountValue = new Prisma.Decimal(data.discountValue);
    }
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.promotion.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
        categories: { select: { id: true, name: true } },
        products: { select: { id: true, name: true, price: true, imageUrl: true, categoryId: true } },
      },
    });
  }

  async delete(id: string): Promise<Promotion> {
    return prisma.promotion.delete({
      where: { id },
    });
  }

  async getMetricsSummary(): Promise<{
    total: number;
    programmed: number;
    active: number;
    finished: number;
    validToday: number;
  }> {
    await this.syncStatuses();
    const now = new Date();

    const [total, programmed, active, finished, validToday] = await Promise.all([
      prisma.promotion.count(),
      prisma.promotion.count({ where: { status: PromotionStatus.PROGRAMMED } }),
      prisma.promotion.count({ where: { status: PromotionStatus.ACTIVE } }),
      prisma.promotion.count({ where: { status: PromotionStatus.FINISHED } }),
      prisma.promotion.count({
        where: {
          status: PromotionStatus.ACTIVE,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
    ]);

    return {
      total,
      programmed,
      active,
      finished,
      validToday,
    };
  }
}

export const promotionRepository = new PromotionRepository();
