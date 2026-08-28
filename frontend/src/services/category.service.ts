import { apiClient } from './api.client.ts';
import { Category, ApiResponse } from '../types/promotion.types.ts';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient<ApiResponse<Category[]>>('/categories');
    return response.data;
  },
};
