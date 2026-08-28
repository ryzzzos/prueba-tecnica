export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type PromotionStatus = 'PROGRAMMED' | 'ACTIVE' | 'FINISHED';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Promotion {
  id: string;
  name: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  discountType: DiscountType;
  discountValue: number | string;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  isValidToday: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionSummary {
  total: number;
  programmed: number;
  active: number;
  finished: number;
  validToday: number;
}

export interface CreatePromotionPayload {
  name: string;
  categoryId: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  status?: PromotionStatus;
}

export interface UpdatePromotionPayload {
  name?: string;
  categoryId?: string;
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  status?: PromotionStatus;
}

export interface PromotionFilterParams {
  status?: PromotionStatus;
  categoryId?: string;
  search?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  count?: number;
  timestamp?: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  issues?: Array<{ field: string; message: string }>;
  details?: unknown;
}
