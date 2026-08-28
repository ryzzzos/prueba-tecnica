import { ApiErrorResponse } from '../types/promotion.types.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;
  public issues?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode = 500, details?: unknown, issues?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.issues = issues;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorPayload: ApiErrorResponse | null = null;
      try {
        errorPayload = (await response.json()) as ApiErrorResponse;
      } catch {
        // Fallback if response is not JSON
      }

      const errorMessage =
        errorPayload?.message ||
        `Error HTTP ${response.status}: ${response.statusText || 'Error en la solicitud'}`;

      throw new ApiError(errorMessage, response.status, errorPayload?.details, errorPayload?.issues);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'No se pudo conectar con el servidor de la API',
      0
    );
  }
}
