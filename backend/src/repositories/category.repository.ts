import { Category } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema.js';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: string, data: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<Category>;
}

export class CategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
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

  async create(data: CreateCategoryInput): Promise<Category> {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        position: data.position ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
