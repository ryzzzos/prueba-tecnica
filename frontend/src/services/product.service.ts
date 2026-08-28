import { apiClient } from './api.client.ts';
import {
  Product,
  ProductMetrics,
  CreateProductPayload,
  UpdateProductPayload,
  ProductFilterParams,
} from '../types/product.types.ts';
import { ApiResponse } from '../types/promotion.types.ts';

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.categoryId && params.categoryId !== 'all') query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    const response = await apiClient<ApiResponse<Product[]>>(endpoint);
    return response.data;
  },

  async getProductMetrics(): Promise<ProductMetrics> {
    const response = await apiClient<ApiResponse<ProductMetrics>>('/products/metrics');
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductPayload): Promise<Product> {
    const response = await apiClient<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductPayload): Promise<Product> {
    const response = await apiClient<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async toggleProductActive(id: string, isActive: boolean): Promise<Product> {
    const response = await apiClient<ApiResponse<Product>>(`/products/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    return response.data;
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
