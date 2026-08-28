export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type PromotionStatus = 'PROGRAMMED' | 'ACTIVE' | 'FINISHED';

export type PromotionScopeType = 'CATEGORY' | 'PRODUCT';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  position?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Promotion {
  id: string;
  name: string;
  scopeType?: PromotionScopeType;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  productId?: string | null;
  product?: {
    id: string;
    name: string;
    price: number | string;
    imageUrl?: string | null;
  } | null;
  categories?: Array<{
    id: string;
    name: string;
  }>;
  products?: Array<{
    id: string;
    name: string;
    price: number | string;
    imageUrl?: string | null;
    categoryId?: string | null;
  }>;
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
  scopeType?: PromotionScopeType;
  categoryId?: string | null;
  categoryIds?: string[];
  productId?: string | null;
  productIds?: string[];
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  status?: PromotionStatus;
}

export interface UpdatePromotionPayload {
  name?: string;
  scopeType?: PromotionScopeType;
  categoryId?: string | null;
  categoryIds?: string[];
  productId?: string | null;
  productIds?: string[];
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  status?: PromotionStatus;
}

export interface PromotionFilterParams {
  status?: PromotionStatus;
  categoryId?: string;
  productId?: string;
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
