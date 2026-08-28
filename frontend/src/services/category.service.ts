import { apiClient } from './api.client.ts';
import { Category, ApiResponse } from '../types/promotion.types.ts';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  async createCategory(data: { name: string; description?: string; position?: number }): Promise<Category> {
    const response = await apiClient<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateCategory(id: string, data: { name?: string; description?: string | null; position?: number; isActive?: boolean }): Promise<Category> {
    const response = await apiClient<ApiResponse<Category>>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
