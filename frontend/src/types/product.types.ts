import { Category } from './promotion.types.ts';

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  sku?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMetrics {
  total: number;
  activeCount: number;
  categoriesCount: number;
  minPrice: number;
  maxPrice: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string | null;
  price: number;
  sku?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  categoryId?: string | null;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string | null;
  price?: number;
  sku?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  categoryId?: string | null;
}

export interface ProductFilterParams {
  status?: 'all' | 'active' | 'inactive';
  categoryId?: string;
  search?: string;
}

export type { Category };
