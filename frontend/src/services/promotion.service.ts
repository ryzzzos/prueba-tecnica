import { apiClient } from './api.client.ts';
import {
  Promotion,
  PromotionSummary,
  CreatePromotionPayload,
  UpdatePromotionPayload,
  PromotionFilterParams,
  PromotionStatus,
  ApiResponse,
} from '../types/promotion.types.ts';

export const promotionService = {
  async getPromotions(filters?: PromotionFilterParams): Promise<Promotion[]> {
    const params: Record<string, string | undefined> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.categoryId) params.categoryId = filters.categoryId;
    if (filters?.search) params.search = filters.search;

    const response = await apiClient<ApiResponse<Promotion[]>>('/promotions', { params });
    return response.data;
  },

  async getSummaryMetrics(): Promise<PromotionSummary> {
    const response = await apiClient<ApiResponse<PromotionSummary>>('/promotions/summary');
    return response.data;
  },

  async getPromotionById(id: string): Promise<Promotion> {
    const response = await apiClient<ApiResponse<Promotion>>(`/promotions/${id}`);
    return response.data;
  },

  async createPromotion(payload: CreatePromotionPayload): Promise<Promotion> {
    const response = await apiClient<ApiResponse<Promotion>>('/promotions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updatePromotion(id: string, payload: UpdatePromotionPayload): Promise<Promotion> {
    const response = await apiClient<ApiResponse<Promotion>>(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async changePromotionStatus(id: string, status: PromotionStatus): Promise<Promotion> {
    const response = await apiClient<ApiResponse<Promotion>>(`/promotions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  async deletePromotion(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/promotions/${id}`, {
      method: 'DELETE',
    });
  },
};
