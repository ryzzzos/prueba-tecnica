import { Promotion, PromotionStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { CreatePromotionInput, UpdatePromotionInput, PromotionQueryInput } from '../schemas/promotion.schema.js';

export type PromotionWithCategory = Promotion & {
  category: {
    id: string;
    name: string;
  };
};

export interface IPromotionRepository {
  findAll(query?: PromotionQueryInput): Promise<PromotionWithCategory[]>;
  findById(id: string): Promise<PromotionWithCategory | null>;
  create(data: CreatePromotionInput): Promise<PromotionWithCategory>;
  update(id: string, data: UpdatePromotionInput): Promise<PromotionWithCategory>;
  delete(id: string): Promise<Promotion>;
  getMetricsSummary(): Promise<{
    total: number;
    programmed: number;
    active: number;
    finished: number;
    validToday: number;
  }>;
}

export class PromotionRepository implements IPromotionRepository {
  async findAll(query?: PromotionQueryInput): Promise<PromotionWithCategory[]> {
    const where: Prisma.PromotionWhereInput = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    return prisma.promotion.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string): Promise<PromotionWithCategory | null> {
    return prisma.promotion.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async create(data: CreatePromotionInput): Promise<PromotionWithCategory> {
    return prisma.promotion.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        discountType: data.discountType,
        discountValue: new Prisma.Decimal(data.discountValue),
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async update(id: string, data: UpdatePromotionInput): Promise<PromotionWithCategory> {
    const updateData: Prisma.PromotionUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
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
        category: {
          select: { id: true, name: true },
        },
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
