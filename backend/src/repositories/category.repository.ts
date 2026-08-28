import { Category } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: { name: string; description?: string }): Promise<Category>;
}

export class CategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async create(data: { name: string; description?: string }): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }
}

export const categoryRepository = new CategoryRepository();
