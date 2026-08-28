import { Category } from '@prisma/client';
import { ICategoryRepository, categoryRepository } from '../repositories/category.repository.js';
import { CreateCategoryInput } from '../schemas/category.schema.js';
import { AppError } from '../middlewares/errorHandler.js';

export class CategoryService {
  constructor(private readonly categoryRepo: ICategoryRepository = categoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new AppError('Categoria no encontrada', 404);
    }
    return category;
  }

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    const existing = await this.categoryRepo.findByName(data.name);
    if (existing) {
      throw new AppError('Ya existe una categoria con este nombre', 409);
    }
    return this.categoryRepo.create(data);
  }
}

export const categoryService = new CategoryService();
