import React from 'react';
import { Search, ShieldCheck, LayoutGrid, List, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import AppIcon from '../ui/AppIcon.tsx';
import CustomSelect from '../ui/CustomSelect.tsx';
import { Category } from '../../types/promotion.types.ts';
import { ProductFilterParams } from '../../types/product.types.ts';

interface CatalogFiltersProps {
  filters: ProductFilterParams;
  onFiltersChange: (next: ProductFilterParams) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: Category[];
}

const STATUS_OPTIONS: Array<{ value: 'all' | 'active' | 'inactive'; label: string }> = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Solo activos' },
  { value: 'inactive', label: 'Solo inactivos' },
];

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  categories,
}) => {
  return (
    <section className="flex flex-col xl:flex-row items-center gap-3 w-full">
      {/* Search Input */}
      <div className="relative flex-1 w-full xl:w-auto">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <AppIcon icon={Search} className="text-[var(--text-muted)]" size="sm" />
        </div>
        <input
          id="catalog-search"
          type="search"
          placeholder="Buscar productos por nombre, SKU o categoría..."
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              search: e.target.value,
            })
          }
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--surface-3)] border border-[var(--border-strong)] text-[13.5px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--app-primary)] transition-all shadow-[var(--shadow-sm)]"
        />
      </div>

      {/* Selects & View Mode Controls */}
      <div className="flex flex-row items-center gap-2 sm:gap-3 w-full xl:w-auto">
        <CustomSelect<'all' | 'active' | 'inactive'>
          id="catalog-status-filter"
          value={filters.status || 'all'}
          onChange={(val) =>
            onFiltersChange({
              ...filters,
              status: val,
            })
          }
          options={STATUS_OPTIONS}
          icon={ShieldCheck}
          variant="glass"
          className="flex-1 min-w-0 sm:flex-none sm:min-w-[170px]"
        />

        <CustomSelect<string>
          id="catalog-category-filter"
          value={filters.categoryId || 'all'}
          onChange={(val) =>
            onFiltersChange({
              ...filters,
              categoryId: val,
            })
          }
          options={[
            { value: 'all', label: 'Todas las categorías' },
            { value: 'null', label: 'Sin categoría' },
            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
          icon={Layers}
          variant="glass"
          className="flex-1 min-w-0 sm:flex-none sm:min-w-[180px]"
        />

        {/* View Mode Toggle Pill */}
        <div className="inline-flex h-11 items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] p-1 shadow-[var(--shadow-sm)] shrink-0 justify-center">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className="group relative inline-flex h-full items-center justify-center rounded-full px-3 text-[13px] font-semibold transition-colors focus:outline-none cursor-pointer"
            aria-label="Vista cuadrícula"
            title="Vista cuadrícula"
          >
            {viewMode === 'grid' && (
              <motion.div
                layoutId="catalog-view-mode-pill"
                className="absolute inset-0 rounded-full bg-[var(--surface-2)] shadow-[var(--shadow-sm)] border border-[var(--border-strong)]"
                initial={false}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <AppIcon
              icon={LayoutGrid}
              size="sm"
              className={`relative z-10 transition-colors ${
                viewMode === 'grid'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className="group relative inline-flex h-full items-center justify-center rounded-full px-3 text-[13px] font-semibold transition-colors focus:outline-none cursor-pointer"
            aria-label="Vista lista"
            title="Vista lista"
          >
            {viewMode === 'list' && (
              <motion.div
                layoutId="catalog-view-mode-pill"
                className="absolute inset-0 rounded-full bg-[var(--surface-2)] shadow-[var(--shadow-sm)] border border-[var(--border-strong)]"
                initial={false}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <AppIcon
              icon={List}
              size="sm"
              className={`relative z-10 transition-colors ${
                viewMode === 'list'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CatalogFilters;
