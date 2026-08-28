import { useState, useEffect, useCallback, useMemo } from 'react';
import { sileo } from 'sileo';
import {
  Product,
  ProductMetrics,
  ProductFilterParams,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/product.types.ts';
import { productService } from '../services/product.service.ts';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilterParams>({
    status: 'all',
    categoryId: 'all',
    search: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, metricsData] = await Promise.all([
        productService.getProducts(filters),
        productService.getProductMetrics(),
      ]);
      setProducts(productsData);
      setMetrics(metricsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(message);
      sileo.error({
        title: 'Error de Catálogo',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter status
      if (filters.status === 'active' && !product.isActive) return false;
      if (filters.status === 'inactive' && product.isActive) return false;

      // Filter category
      if (filters.categoryId && filters.categoryId !== 'all') {
        if (filters.categoryId === 'null') {
          if (product.categoryId !== null && product.categoryId !== undefined) return false;
        } else if (product.categoryId !== filters.categoryId) {
          return false;
        }
      }

      // Filter search
      if (filters.search && filters.search.trim()) {
        const term = filters.search.trim().toLowerCase();
        const matchesName = product.name.toLowerCase().includes(term);
        const matchesDesc = (product.description || '').toLowerCase().includes(term);
        const matchesSku = (product.sku || '').toLowerCase().includes(term);
        const matchesCat = (product.category?.name || '').toLowerCase().includes(term);
        if (!matchesName && !matchesDesc && !matchesSku && !matchesCat) return false;
      }

      return true;
    });
  }, [products, filters]);

  const createProduct = async (payload: CreateProductPayload): Promise<boolean> => {
    setSaving(true);
    try {
      await productService.createProduct(payload);
      await fetchProducts();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el producto';
      sileo.error({
        title: 'Error al crear producto',
        description: message,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async (id: string, payload: UpdateProductPayload): Promise<boolean> => {
    setSaving(true);
    try {
      await productService.updateProduct(id, payload);
      await fetchProducts();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el producto';
      sileo.error({
        title: 'Error al actualizar producto',
        description: message,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleProductActive = async (id: string, nextActiveState: boolean): Promise<boolean> => {
    setSaving(true);
    try {
      await productService.toggleProductActive(id, nextActiveState);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: nextActiveState } : p))
      );
      // Reload metrics in background
      productService.getProductMetrics().then(setMetrics).catch(() => {});
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cambiar el estado del producto';
      sileo.error({
        title: 'Error al cambiar estado',
        description: message,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setSaving(true);
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      productService.getProductMetrics().then(setMetrics).catch(() => {});
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el producto';
      sileo.error({
        title: 'Error al eliminar producto',
        description: message,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    products,
    filteredProducts,
    metrics,
    filters,
    setFilters,
    loading,
    saving,
    error,
    reload: fetchProducts,
    create: createProduct,
    update: updateProduct,
    toggleActive: toggleProductActive,
    remove: deleteProduct,
  };
}
