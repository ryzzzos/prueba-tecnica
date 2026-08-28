import { useState, useEffect, useCallback } from 'react';
import { sileo } from 'sileo';
import { Category } from '../types/promotion.types.ts';
import { categoryService } from '../services/category.service.ts';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
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

  const createCategory = async (data: { name: string; description?: string; position?: number }): Promise<Category> => {
    setSaving(true);
    try {
      const newCat = await categoryService.createCategory(data);
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async (id: string, data: { name?: string; description?: string | null; position?: number; isActive?: boolean }): Promise<Category> => {
    setSaving(true);
    try {
      const updatedCat = await categoryService.updateCategory(id, data);
      setCategories((prev) => prev.map((c) => (c.id === id ? updatedCat : c)));
      return updatedCat;
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setSaving(true);
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } finally {
      setSaving(false);
    }
  };

  return {
    categories,
    loading,
    saving,
    error,
    reload: fetchCategories,
    refetchCategories: fetchCategories,
    create: createCategory,
    update: updateCategory,
    remove: deleteCategory,
  };
}
