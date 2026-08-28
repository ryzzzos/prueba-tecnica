import { useState } from 'react';
import { sileo } from 'sileo';
import CatalogHeader from './CatalogHeader.tsx';
import CatalogFilters from './CatalogFilters.tsx';
import CatalogList from './CatalogList.tsx';
import ProductFormModal from './ProductFormModal.tsx';
import ProductCategoriesModal from './ProductCategoriesModal.tsx';
import { useProducts } from '../../hooks/useProducts.ts';
import { useCategories } from '../../hooks/useCategories.ts';
import { Product, CreateProductPayload, UpdateProductPayload } from '../../types/product.types.ts';

export function CatalogPage() {
  const {
    products,
    filteredProducts,
    metrics,
    filters,
    setFilters,
    loading,
    saving,
    error,
    reload,
    create,
    update,
    toggleActive,
    remove,
  } = useProducts();

  const {
    categories,
    loading: categoriesLoading,
    reload: reloadCategories,
    create: createCategory,
    update: updateCategory,
    remove: removeCategory,
  } = useCategories();

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductSubmit = async (data: CreateProductPayload | UpdateProductPayload): Promise<boolean> => {
    let success = false;
    if (editingProduct) {
      success = await update(editingProduct.id, data as UpdateProductPayload);
      if (success) {
        sileo.success({
          title: 'Producto Actualizado',
          description: `El producto "${data.name}" se guardó correctamente.`,
        });
      }
    } else {
      success = await create(data as CreateProductPayload);
      if (success) {
        sileo.success({
          title: 'Producto Creado',
          description: `El producto "${data.name}" se registró en el catálogo.`,
        });
      }
    }
    return success;
  };

  const handleToggleActive = async (product: Product) => {
    const nextState = !product.isActive;
    const actionWord = nextState ? 'activado' : 'desactivado';
    const success = await toggleActive(product.id, nextState);
    if (success) {
      sileo.success({
        title: `Producto ${actionWord}`,
        description: `"${product.name}" ha sido ${actionWord}.`,
      });
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `¿Deseas eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    const success = await remove(product.id);
    if (success) {
      sileo.success({
        title: 'Producto Eliminado',
        description: `"${product.name}" se eliminó del catálogo.`,
      });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <section className="bg-[var(--surface-1)] flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center rounded-[var(--radius-2xl)] border border-[var(--border-strong)]">
        <p className="text-lg font-bold text-[var(--text-primary)]">No se pudieron cargar los productos</p>
        <p className="text-xs text-[var(--text-secondary)] max-w-md">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-2 px-5 py-2.5 rounded-full bg-[var(--app-primary)] text-white text-xs font-bold shadow-md cursor-pointer"
        >
          Reintentar
        </button>
      </section>
    );
  }

  return (
    <div className="flex flex-col min-h-full space-y-5">
      {/* Header with KPIs & Actions */}
      <CatalogHeader
        products={products}
        metrics={metrics}
        onCreateProduct={openCreateModal}
        onManageCategories={() => setCategoriesModalOpen(true)}
      />

      {/* Filters Bar */}
      <CatalogFilters
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
      />

      {/* Products Display (Grid / List) */}
      <div className="flex-1 pb-10">
        {filteredProducts.length === 0 ? (
          <section className="flex flex-col items-center justify-center rounded-[var(--radius-2xl)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)] p-12 text-center shadow-[var(--shadow-sm)]">
            <p className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              No hay productos para este filtro
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md">
              Ajusta los términos de búsqueda o registra un nuevo producto en el catálogo.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 px-5 py-2.5 rounded-full bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] text-white text-xs font-bold shadow-sm hover:brightness-110 cursor-pointer"
            >
              Nuevo Producto
            </button>
          </section>
        ) : (
          <CatalogList
            products={filteredProducts}
            disabled={saving}
            viewMode={viewMode}
            onEdit={openEditModal}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteProduct}
            categories={categories}
          />
        )}
      </div>

      {/* Product Form Drawer */}
      <ProductFormModal
        open={productModalOpen}
        mode={editingProduct ? 'edit' : 'create'}
        product={editingProduct}
        categories={categories}
        categoriesLoading={categoriesLoading}
        saving={saving}
        onClose={closeProductModal}
        onSubmit={handleProductSubmit}
      />

      {/* Categories Management Drawer */}
      <ProductCategoriesModal
        open={categoriesModalOpen}
        onClose={() => {
          setCategoriesModalOpen(false);
          reload();
          reloadCategories();
        }}
        categories={categories}
        loading={categoriesLoading}
        onCreateCategory={createCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={removeCategory}
      />
    </div>
  );
}

export default CatalogPage;
