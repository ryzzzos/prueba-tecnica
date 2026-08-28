import React from 'react';
import { CheckCircle2, Plus, Layers, CircleDollarSign } from 'lucide-react';
import AppIcon from '../ui/AppIcon.tsx';
import { Product, ProductMetrics } from '../../types/product.types.ts';
import { NumberTicker } from '../ui/NumberTicker.tsx';

interface CatalogHeaderProps {
  products: Product[];
  metrics: ProductMetrics | null;
  onCreateProduct: () => void;
  onManageCategories: () => void;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  products,
  metrics,
  onCreateProduct,
  onManageCategories,
}) => {
  const activeProducts = products.filter((p) => p.isActive);
  const activeCount = metrics ? metrics.activeCount : activeProducts.length;

  const validPrices = activeProducts.map((p) => Number(p.price)).filter((n) => !isNaN(n));
  const minPrice = metrics ? metrics.minPrice : validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxPrice = metrics ? metrics.maxPrice : validPrices.length > 0 ? Math.max(...validPrices) : 0;

  const formatPrice = (amount: number) => `$${Number(amount).toLocaleString('es-CO')}`;

  const priceRange =
    activeCount === 0
      ? formatPrice(0)
      : minPrice === maxPrice
        ? formatPrice(minPrice)
        : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  const categoriesCount = metrics
    ? metrics.categoriesCount
    : new Set(activeProducts.map((p) => p.categoryId).filter(Boolean)).size;

  return (
    <header className="flex flex-col gap-5">
      {/* Top action row */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Catálogo & Productos
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Administra el inventario de productos comercializados, precios y asignación de categorías para POS.
          </p>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onManageCategories}
            className="flex-1 sm:flex-none inline-flex items-center justify-center min-h-11 rounded-full px-5 shadow-[var(--shadow-sm)] transition-all active:scale-[0.98] border border-[var(--border-strong)] bg-[var(--surface-3)] hover:bg-[var(--surface-2)] cursor-pointer"
          >
            <AppIcon icon={Layers} className="mr-2 text-[var(--text-secondary)]" size="sm" />
            <span className="font-bold text-xs tracking-tight text-[var(--text-primary)]">Categorías</span>
          </button>

          <button
            type="button"
            onClick={onCreateProduct}
            className="flex-1 sm:flex-none inline-flex items-center justify-center min-h-11 rounded-full px-5 shadow-[var(--shadow-md)] transition-all hover:brightness-110 active:scale-[0.98] bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] text-white border border-blue-400/30 cursor-pointer"
          >
            <AppIcon icon={Plus} className="mr-2 text-white" size="sm" />
            <span className="font-bold text-xs tracking-tight text-white">Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 3 Apple/Citas Standard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Catálogo Activo */}
        <article className="flex flex-1 items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-info)_8%,var(--surface-3)),var(--surface-3))] p-4 sm:p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-info)] text-white shadow-sm">
              <AppIcon icon={CheckCircle2} size="sm" className="text-white" />
            </div>
            <p className="text-xs sm:text-sm font-bold tracking-tight text-[var(--text-primary)] truncate">
              Catálogo Activo
            </p>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] shrink-0">
            <NumberTicker value={activeCount} />
          </div>
        </article>

        {/* Categorías con Productos */}
        <article className="flex flex-1 items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary)_8%,var(--surface-3)),var(--surface-3))] p-4 sm:p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary)] text-white shadow-sm">
              <AppIcon icon={Layers} size="sm" className="text-white" />
            </div>
            <p className="text-xs sm:text-sm font-bold tracking-tight text-[var(--text-primary)] truncate">
              Categorías
            </p>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] shrink-0">
            <NumberTicker value={categoriesCount} />
          </div>
        </article>

        {/* Rango de Precios */}
        <article className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-1 items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-success)_8%,var(--surface-3)),var(--surface-3))] p-4 sm:p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white shadow-sm">
              <AppIcon icon={CircleDollarSign} size="sm" className="text-white" />
            </div>
            <p className="text-xs sm:text-sm font-bold tracking-tight text-[var(--text-primary)] truncate">
              Rango de Precios
            </p>
          </div>
          <p className="text-base sm:text-lg font-black tracking-tight text-[var(--text-primary)] shrink-0">
            {priceRange}
          </p>
        </article>
      </div>
    </header>
  );
};

export default CatalogHeader;
