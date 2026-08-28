import { Category } from '@prisma/client';
import { ICategoryRepository, categoryRepository } from '../repositories/category.repository.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema.js';
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

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) {
      throw new AppError('Categoria no encontrada', 404);
    }

    if (data.name && data.name !== existing.name) {
      const nameConflict = await this.categoryRepo.findByName(data.name);
      if (nameConflict) {
        throw new AppError('Ya existe una categoria con este nombre', 409);
      }
    }

    return this.categoryRepo.update(id, data);
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.categoryRepo.findById(id);
    if (!existing) {
      throw new AppError('Categoria no encontrada', 404);
    }

    await this.categoryRepo.delete(id);
    return {
      success: true,
      message: `Categoria "${existing.name}" eliminada correctamente`,
    };
  }
}

export const categoryService = new CategoryService();
