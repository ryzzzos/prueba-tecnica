import { useState, useEffect, useCallback } from 'react';
import { sileo } from 'sileo';
import { Category } from '../types/promotion.types.ts';
import { categoryService } from '../services/category.service.ts';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar categorias';
      setError(message);
      sileo.error({
        title: 'Error de Categorias',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetchCategories: fetchCategories,
  };
}
